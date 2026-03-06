const REDIRECT_HOST = "asd111.pages.dev";
const CANONICAL_ORIGIN = "https://neoncps.com";

export function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === REDIRECT_HOST) {
    const redirectUrl = new URL(`${url.pathname}${url.search}`, CANONICAL_ORIGIN);
    return Response.redirect(redirectUrl.toString(), 301);
  }

  return context.next();
}
