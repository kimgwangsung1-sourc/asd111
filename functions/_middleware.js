const REDIRECT_HOST = "asd111.pages.dev";
const CANONICAL_ORIGIN = "https://neoncps.com";

export function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === REDIRECT_HOST) {
    const redirectUrl = new URL(`${url.pathname}${url.search}`, CANONICAL_ORIGIN);
    return new Response(null, {
      status: 301,
      headers: {
        Location: redirectUrl.toString(),
        "X-Robots-Tag": "noindex, nofollow, noarchive"
      }
    });
  }

  return context.next();
}
