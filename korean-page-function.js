const CANONICAL_ORIGIN = "https://neoncps.com";
const STABLE_CSP = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://static.cloudflareinsights.com https://ep2.adtrafficquality.google; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://formspree.io https://www.google-analytics.com https://region1.google-analytics.com https://csi.gstatic.com https://www.clarity.ms https://*.clarity.ms https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://cloudflareinsights.com https://static.cloudflareinsights.com; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://www.google.com; form-action 'self' https://formspree.io; upgrade-insecure-requests";
const LOCALIZED_PATHS = [
  "/",
  "/guides/",
  "/guides/how-neoncps-measures-cps/",
  "/guides/why-cps-scores-change/",
  "/guides/mobile-vs-mouse-cps/",
  "/guides/safe-cps-practice/",
  "/about/",
  "/editorial-policy/"
];

function replaceOrThrow(source, pattern, replacement, label) {
  const next = source.replace(pattern, replacement);
  if (next === source) {
    throw new Error(`Template replacement failed: ${label}`);
  }
  return next;
}

function createStructuredData(config) {
  return {
    "@context": "https://schema.org",
    "@type": config.schemaType,
    [config.schemaKey]: config.schemaName,
    url: config.koreanUrl,
    description: config.description,
    dateModified: config.dateModified,
    inLanguage: "ko"
  };
}

export function createKoreanPageHandler(config) {
  return async function onRequest(context) {
    const assetUrl = new URL(config.assetPath, context.request.url);
    const assetRequest = new Request(assetUrl.toString(), {
      method: "GET",
      headers: context.request.headers
    });
    const response = await context.env.ASSETS.fetch(assetRequest);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      return response;
    }

    let html = await response.text();

    html = replaceOrThrow(html, /<html lang="[^"]+">/, '<html lang="ko">', "html lang");
    html = replaceOrThrow(
      html,
      /<link rel="canonical" href="[^"]+">\s*<link rel="alternate" hreflang="en" href="[^"]+">\s*<link rel="alternate" hreflang="ko" href="[^"]+">\s*<link rel="alternate" hreflang="x-default" href="[^"]+">/,
      `<link rel="canonical" href="${config.koreanUrl}">\n  <link rel="alternate" hreflang="en" href="${config.englishUrl}">\n  <link rel="alternate" hreflang="ko" href="${config.koreanUrl}">\n  <link rel="alternate" hreflang="x-default" href="${config.englishUrl}">`,
      "canonical and hreflang"
    );
    html = replaceOrThrow(html, /<meta name="description" content="[^"]+">/, `<meta name="description" content="${config.description}">`, "description");
    html = replaceOrThrow(html, /<meta property="og:title" content="[^"]+">/, `<meta property="og:title" content="${config.title}">`, "og title");
    html = replaceOrThrow(html, /<meta property="og:description" content="[^"]+">/, `<meta property="og:description" content="${config.description}">`, "og description");
    html = replaceOrThrow(html, /<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${config.koreanUrl}">`, "og url");
    html = replaceOrThrow(html, /<meta name="twitter:title" content="[^"]+">/, `<meta name="twitter:title" content="${config.title}">`, "twitter title");
    html = replaceOrThrow(html, /<meta name="twitter:description" content="[^"]+">/, `<meta name="twitter:description" content="${config.description}">`, "twitter description");
    html = replaceOrThrow(html, /<title>[^<]+<\/title>/, `<title>${config.title}</title>`, "title");
    html = replaceOrThrow(
      html,
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n${JSON.stringify(createStructuredData(config), null, 2)}\n  </script>`,
      "structured data"
    );

    for (const path of LOCALIZED_PATHS) {
      const englishHref = `href="${path}"`;
      const koreanPath = path === "/" ? "/ko/" : `/ko${path}`;
      html = html.replaceAll(englishHref, `href="${koreanPath}"`);
    }

    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=UTF-8");
    headers.set("content-language", "ko");
    headers.set("content-security-policy", STABLE_CSP);

    return new Response(html, {
      status: response.status,
      headers
    });
  };
}
