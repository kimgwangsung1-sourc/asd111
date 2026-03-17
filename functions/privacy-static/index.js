export function onRequest(context) {
  const requestUrl = new URL(context.request.url);
  const redirectUrl = new URL("/privacy/", requestUrl);
  redirectUrl.search = requestUrl.search;

  return Response.redirect(redirectUrl.toString(), 301);
}
