const REDIRECT_HOSTS = new Set(["asd111.pages.dev", "www.neoncps.com"]);
const TRAILING_SLASH_PATHS = new Set([
  "/ko",
  "/ko/guides",
  "/ko/guides/how-neoncps-measures-cps",
  "/ko/guides/why-cps-scores-change",
  "/ko/guides/mobile-vs-mouse-cps",
  "/ko/guides/safe-cps-practice",
  "/ko/about",
  "/ko/editorial-policy"
]);
const CANONICAL_ORIGIN = "https://neoncps.com";

export function onRequest(context) {
  const url = new URL(context.request.url);
  const deduplicatedPath = url.pathname.startsWith("/ko/ko/")
    ? `/ko${url.pathname.slice(6)}`
    : url.pathname;
  const canonicalPath = TRAILING_SLASH_PATHS.has(deduplicatedPath)
    ? `${deduplicatedPath}/`
    : deduplicatedPath;

  if (REDIRECT_HOSTS.has(url.hostname) || canonicalPath !== url.pathname) {
    const redirectUrl = new URL(`${canonicalPath}${url.search}`, CANONICAL_ORIGIN);
    const headers = new Headers({ Location: redirectUrl.toString() });

    if (url.hostname === "asd111.pages.dev") {
      headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    }

    return new Response(null, {
      status: 301,
      headers
    });
  }

  return context.next();
}
