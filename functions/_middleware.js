const REDIRECT_HOSTS = new Set(["asd111.pages.dev", "www.neoncps.com"]);
const CANONICAL_ORIGIN = "https://neoncps.com";

export function onRequest(context) {
  const url = new URL(context.request.url);

  if (REDIRECT_HOSTS.has(url.hostname)) {
    const redirectUrl = new URL(`${url.pathname}${url.search}`, CANONICAL_ORIGIN);
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
