import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ORIGIN = "https://neoncps.com";
const pairs = [
  { englishPath: "/", koreanPath: "/ko/", htmlFile: "index.html", functionFile: "functions/ko/index.js" },
  { englishPath: "/guides/", koreanPath: "/ko/guides/", htmlFile: "guides/index.html", functionFile: "functions/ko/guides/index.js" },
  { englishPath: "/guides/how-neoncps-measures-cps/", koreanPath: "/ko/guides/how-neoncps-measures-cps/", htmlFile: "guides/how-neoncps-measures-cps/index.html", functionFile: "functions/ko/guides/how-neoncps-measures-cps/index.js" },
  { englishPath: "/guides/why-cps-scores-change/", koreanPath: "/ko/guides/why-cps-scores-change/", htmlFile: "guides/why-cps-scores-change/index.html", functionFile: "functions/ko/guides/why-cps-scores-change/index.js" },
  { englishPath: "/guides/mobile-vs-mouse-cps/", koreanPath: "/ko/guides/mobile-vs-mouse-cps/", htmlFile: "guides/mobile-vs-mouse-cps/index.html", functionFile: "functions/ko/guides/mobile-vs-mouse-cps/index.js" },
  { englishPath: "/guides/safe-cps-practice/", koreanPath: "/ko/guides/safe-cps-practice/", htmlFile: "guides/safe-cps-practice/index.html", functionFile: "functions/ko/guides/safe-cps-practice/index.js" },
  { englishPath: "/about/", koreanPath: "/ko/about/", htmlFile: "about/index.html", functionFile: "functions/ko/about/index.js" },
  { englishPath: "/editorial-policy/", koreanPath: "/ko/editorial-policy/", htmlFile: "editorial-policy/index.html", functionFile: "functions/ko/editorial-policy/index.js" }
];

const localizedPaths = pairs.map(({ englishPath }) => englishPath);

function dataModule(source) {
  return `data:text/javascript;base64,${Buffer.from(source, "utf8").toString("base64")}`;
}

async function importSource(file) {
  let source = await readFile(file, "utf8");
  source = source.replace(
    /import \{ createKoreanPageHandler \} from "[^"]+";/,
    "const createKoreanPageHandler = globalThis.__createKoreanPageHandler;"
  );
  return import(dataModule(source));
}

function assertHeadSignals(html, canonicalUrl, englishUrl, koreanUrl, label) {
  assert.ok(html.includes(`<link rel="canonical" href="${canonicalUrl}">`), `${label}: canonical`);
  assert.ok(html.includes(`<link rel="alternate" hreflang="en" href="${englishUrl}">`), `${label}: en hreflang`);
  assert.ok(html.includes(`<link rel="alternate" hreflang="ko" href="${koreanUrl}">`), `${label}: ko hreflang`);
  assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${englishUrl}">`), `${label}: x-default hreflang`);
}

function extractSitemapBlock(sitemap, url) {
  const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = sitemap.match(new RegExp(`<url>\\s*<loc>${escapedUrl}<\\/loc>[\\s\\S]*?<\\/url>`));
  assert.ok(match, `sitemap entry: ${url}`);
  return match[0];
}

const helperSource = await readFile("korean-page-function.js", "utf8");
const helperModule = await import(dataModule(helperSource));
globalThis.__createKoreanPageHandler = helperModule.createKoreanPageHandler;

const sitemap = await readFile("sitemap.xml", "utf8");
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(sitemapLocations).size, sitemapLocations.length, "sitemap loc values must be unique");
assert.equal(sitemapLocations.length, 17, "sitemap URL count");

for (const pair of pairs) {
  const englishUrl = `${ORIGIN}${pair.englishPath}`;
  const koreanUrl = `${ORIGIN}${pair.koreanPath}`;
  const sourceHtml = await readFile(pair.htmlFile, "utf8");
  const routeModule = await importSource(pair.functionFile);
  let requestedAssetPath = "";

  assertHeadSignals(sourceHtml, englishUrl, englishUrl, koreanUrl, pair.htmlFile);

  const response = await routeModule.onRequest({
    request: new Request(koreanUrl),
    env: {
      ASSETS: {
        fetch: async (request) => {
          requestedAssetPath = new URL(request.url).pathname;
          return new Response(sourceHtml, {
            status: 200,
            headers: { "content-type": "text/html; charset=UTF-8" }
          });
        }
      }
    }
  });
  const koreanHtml = await response.text();

  assert.equal(requestedAssetPath, pair.englishPath, `${pair.koreanPath}: asset path`);
  assert.equal(response.status, 200, `${pair.koreanPath}: status`);
  assert.equal(response.headers.get("content-language"), "ko", `${pair.koreanPath}: content language`);
  assert.ok(response.headers.get("content-security-policy"), `${pair.koreanPath}: CSP`);
  assert.ok(koreanHtml.includes('<html lang="ko">'), `${pair.koreanPath}: html lang`);
  assertHeadSignals(koreanHtml, koreanUrl, englishUrl, koreanUrl, pair.koreanPath);
  assert.ok(koreanHtml.includes('"inLanguage": "ko"') || pair.koreanPath === "/ko/", `${pair.koreanPath}: structured language`);
  assert.ok(!koreanHtml.includes("/ko/ko/"), `${pair.koreanPath}: duplicate Korean prefix`);

  for (const path of localizedPaths) {
    assert.ok(!koreanHtml.includes(`href="${path}"`), `${pair.koreanPath}: untranslated link ${path}`);
  }

  for (const url of [englishUrl, koreanUrl]) {
    const block = extractSitemapBlock(sitemap, url);
    assert.ok(block.includes(`hreflang="en" href="${englishUrl}"`), `${url}: sitemap en hreflang`);
    assert.ok(block.includes(`hreflang="ko" href="${koreanUrl}"`), `${url}: sitemap ko hreflang`);
    assert.ok(block.includes(`hreflang="x-default" href="${englishUrl}"`), `${url}: sitemap x-default`);
  }
}

const docsSourceFiles = pairs
  .filter(({ englishPath }) => englishPath !== "/")
  .map(({ htmlFile }) => htmlFile);

for (const file of docsSourceFiles) {
  const html = await readFile(file, "utf8");
  assert.ok(html.includes("window.location.pathname"), `${file}: URL-based initial language`);
  assert.ok(!html.includes("var storedLang"), `${file}: stored language must not override URL`);
}

const docsJs = await readFile("docs.js", "utf8");
for (const path of localizedPaths) {
  assert.ok(docsJs.includes(`'${path}'`), `docs.js localized path: ${path}`);
}

const middlewareModule = await importSource("functions/_middleware.js");
for (const pair of pairs) {
  const noSlashPath = pair.koreanPath.slice(0, -1);
  const slashResponse = await middlewareModule.onRequest({
    request: new Request(`${ORIGIN}${noSlashPath}`),
    next: () => new Response("next")
  });
  assert.equal(slashResponse.status, 301, `${noSlashPath}: trailing slash redirect`);
  assert.equal(slashResponse.headers.get("location"), `${ORIGIN}${pair.koreanPath}`, `${noSlashPath}: redirect location`);

  const duplicatePath = pair.englishPath === "/"
    ? "/ko/ko/"
    : `/ko/ko${pair.englishPath}`;
  const duplicateResponse = await middlewareModule.onRequest({
    request: new Request(`${ORIGIN}${duplicatePath}`),
    next: () => new Response("next")
  });
  assert.equal(duplicateResponse.status, 301, `${duplicatePath}: duplicate prefix redirect`);
  assert.equal(duplicateResponse.headers.get("location"), `${ORIGIN}${pair.koreanPath}`, `${duplicatePath}: duplicate redirect location`);
}

delete globalThis.__createKoreanPageHandler;
console.log(`Localized route checks passed for ${pairs.length} language pairs.`);
