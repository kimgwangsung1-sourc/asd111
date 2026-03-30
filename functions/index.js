const REDIRECT_HOST = "asd111.pages.dev";
const CANONICAL_ORIGIN = "https://neoncps.com";
const STABLE_CSP = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://static.cloudflareinsights.com https://ep2.adtrafficquality.google; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://formspree.io https://www.google-analytics.com https://region1.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://cloudflareinsights.com https://static.cloudflareinsights.com; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://www.google.com; form-action 'self' https://formspree.io; upgrade-insecure-requests";

export function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === REDIRECT_HOST) {
    const redirectUrl = new URL(`${url.pathname}${url.search}`, CANONICAL_ORIGIN);
    return Response.redirect(redirectUrl.toString(), 301);
  }

  return context.env.ASSETS.fetch(context.request).then((response) => {
    const headers = new Headers(response.headers);
    headers.set("content-security-policy", STABLE_CSP);

    return new Response(response.body, {
      status: response.status,
      headers
    });
  });
}
