const CANONICAL_ORIGIN = "https://neoncps.com";
const ENGLISH_GUIDE_URL = `${CANONICAL_ORIGIN}/guides/why-cps-scores-change/`;
const KOREAN_GUIDE_URL = `${CANONICAL_ORIGIN}/ko/guides/why-cps-scores-change/`;
const STABLE_CSP = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://static.cloudflareinsights.com https://ep2.adtrafficquality.google; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://formspree.io https://www.google-analytics.com https://region1.google-analytics.com https://csi.gstatic.com https://www.clarity.ms https://*.clarity.ms https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://cloudflareinsights.com https://static.cloudflareinsights.com; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://www.google.com; form-action 'self' https://formspree.io; upgrade-insecure-requests";

const koreanStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "기록이 시도마다 달라지는 이유",
  url: KOREAN_GUIDE_URL,
  description: "CPS 점수가 시도마다 왜 달라지는지 설명하는 한국어 가이드입니다. 피로, 리듬, 브라우저 부하, 시간 경계가 결과에 어떤 영향을 주는지 정리했습니다.",
  dateModified: "2026-03-30",
  inLanguage: "ko"
};

function replaceOrThrow(source, pattern, replacement, label) {
  const next = source.replace(pattern, replacement);
  if (next === source) {
    throw new Error(`Template replacement failed: ${label}`);
  }
  return next;
}

export async function onRequest(context) {
  const assetUrl = new URL("/guides/why-cps-scores-change/", context.request.url);
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
    /<link rel="canonical" href="[^"]+">/,
    `<link rel="canonical" href="${KOREAN_GUIDE_URL}">\n  <link rel="alternate" hreflang="en" href="${ENGLISH_GUIDE_URL}">\n  <link rel="alternate" hreflang="ko" href="${KOREAN_GUIDE_URL}">\n  <link rel="alternate" hreflang="x-default" href="${ENGLISH_GUIDE_URL}">`,
    "canonical and hreflang"
  );
  html = replaceOrThrow(
    html,
    /<meta name="description" content="[^"]+">/,
    '<meta name="description" content="CPS 점수가 시도마다 왜 달라지는지 설명하는 한국어 가이드입니다. 피로, 리듬, 브라우저 부하, 시간 경계가 결과에 어떤 영향을 주는지 정리했습니다.">',
    "description"
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:title" content="[^"]+">/,
    '<meta property="og:title" content="기록이 시도마다 달라지는 이유 | NEONCPS 가이드">',
    "og title"
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:description" content="[^"]+">/,
    '<meta property="og:description" content="CPS 점수가 시도마다 왜 달라지는지 설명하는 한국어 가이드입니다. 피로, 리듬, 브라우저 부하, 시간 경계가 결과에 어떤 영향을 주는지 정리했습니다.">',
    "og description"
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:url" content="[^"]+">/,
    `<meta property="og:url" content="${KOREAN_GUIDE_URL}">`,
    "og url"
  );
  html = replaceOrThrow(
    html,
    /<meta name="twitter:title" content="[^"]+">/,
    '<meta name="twitter:title" content="기록이 시도마다 달라지는 이유 | NEONCPS 가이드">',
    "twitter title"
  );
  html = replaceOrThrow(
    html,
    /<meta name="twitter:description" content="[^"]+">/,
    '<meta name="twitter:description" content="CPS 점수가 시도마다 왜 달라지는지 설명하는 한국어 가이드입니다. 피로, 리듬, 브라우저 부하, 시간 경계가 결과에 어떤 영향을 주는지 정리했습니다.">',
    "twitter description"
  );
  html = replaceOrThrow(
    html,
    /<title>[^<]+<\/title>/,
    '<title>기록이 시도마다 달라지는 이유 | NEONCPS 가이드</title>',
    "title"
  );
  html = replaceOrThrow(
    html,
    /<script>\s*\(function \(\) \{[\s\S]*?\}\)\(\);\s*<\/script>/,
    `<script>
  (function () {
    try {
      document.documentElement.classList.add('lang-ko');
      document.documentElement.setAttribute('lang', 'ko');
      if ((localStorage.getItem('neon_theme') || 'dark') === 'light') {
        document.documentElement.classList.add('light');
      }
    } catch (err) {
      document.documentElement.classList.add('lang-ko');
      document.documentElement.setAttribute('lang', 'ko');
    }
  })();
</script>`,
    "initial language script"
  );
  if (!html.includes('href="/"')) {
    throw new Error("Template replacement failed: korean home links");
  }
  html = html.replaceAll('href="/"', 'href="/ko/"');
  html = replaceOrThrow(
    html,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(koreanStructuredData, null, 2)}\n  </script>`,
    "structured data"
  );

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=UTF-8");
  headers.set("content-language", "ko");
  headers.set("content-security-policy", STABLE_CSP);

  return new Response(html, {
    status: response.status,
    headers
  });
}
