export function onRequest(context) {
  const assetUrl = new URL("/privacy/index.html", context.request.url);
  const assetRequest = new Request(assetUrl.toString(), context.request);

  return context.env.ASSETS.fetch(assetRequest);
}
