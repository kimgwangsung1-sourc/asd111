const REDIRECT_HOSTS = new Set(["asd111.pages.dev", "www.neoncps.com"]);
const TRAILING_SLASH_PATHS = new Set([
  "/ko",
  "/ko/guides/why-cps-scores-change"
]);
const CANONICAL_ORIGIN = "https://neoncps.com";

export function onRequest(context) {
  const url = new URL(context.request.url);
  const canonicalPath = TRAILING_SLASH_PATHS.has(url.pathname)
    ? `${url.pathname}/`
    : url.pathname;

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
