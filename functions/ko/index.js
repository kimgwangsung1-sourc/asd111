const CANONICAL_ORIGIN = "https://neoncps.com";
const KOREAN_ORIGIN = `${CANONICAL_ORIGIN}/ko/`;
const STABLE_CSP = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://static.cloudflareinsights.com https://ep2.adtrafficquality.google; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://formspree.io https://www.google-analytics.com https://region1.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://cloudflareinsights.com https://static.cloudflareinsights.com; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://www.google.com; form-action 'self' https://formspree.io; upgrade-insecure-requests";

const koreanStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${CANONICAL_ORIGIN}/#organization`,
      name: "NEONCPS",
      url: `${CANONICAL_ORIGIN}/`
    },
    {
      "@type": "WebSite",
      "@id": `${CANONICAL_ORIGIN}/#website`,
      url: `${CANONICAL_ORIGIN}/`,
      name: "NEONCPS",
      inLanguage: ["en", "ko"]
    },
    {
      "@type": "WebPage",
      "@id": `${KOREAN_ORIGIN}#webpage`,
      url: KOREAN_ORIGIN,
      name: "NEONCPS | 무료 CPS 테스트와 가이드 (1초, 5초, 10초, 60초)",
      description: "PC와 모바일에서 사용할 수 있는 무료 CPS 테스트와 가이드입니다. 점수 해석, 측정 방식, 정확도 팁, 안전 안내를 함께 제공합니다.",
      isPartOf: { "@id": `${CANONICAL_ORIGIN}/#website` },
      about: { "@id": `${KOREAN_ORIGIN}#app` },
      publisher: { "@id": `${CANONICAL_ORIGIN}/#organization` },
      inLanguage: "ko",
      dateModified: "2026-03-11"
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${KOREAN_ORIGIN}#app`,
      name: "NEONCPS",
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      url: KOREAN_ORIGIN,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${CANONICAL_ORIGIN}/#organization` }
    },
    {
      "@type": "FAQPage",
      "@id": `${KOREAN_ORIGIN}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "CPS란 무엇인가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CPS는 초당 클릭 수를 뜻합니다. 총 클릭 수를 선택한 측정 시간으로 나누어 계산합니다."
          }
        },
        {
          "@type": "Question",
          name: "왜 시도할 때마다 결과가 달라지나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "기기 입력 지연, 브라우저 성능, 손 피로도, 클릭 리듬 차이 때문에 결과가 달라질 수 있습니다."
          }
        },
        {
          "@type": "Question",
          name: "모바일에서도 사용할 수 있나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "네. NEONCPS는 반응형 UI로 PC와 모바일 입력을 모두 지원합니다."
          }
        },
        {
          "@type": "Question",
          name: "더 일관된 CPS 결과를 얻으려면 어떻게 해야 하나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "같은 기기, 같은 브라우저, 같은 자세로 반복 측정하고 시작 전에 손을 짧게 풀어주면 비교가 쉬워집니다."
          }
        },
        {
          "@type": "Question",
          name: "이 도구는 의료 진단용인가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "아니요. 이 도구는 일상적인 반응 속도 확인용이며 의료 또는 진단 목적이 아닙니다."
          }
        },
        {
          "@type": "Question",
          name: "1초 테스트와 60초 테스트는 무엇이 다른가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "1초 테스트는 순간 폭발력을 보기 좋고, 60초 테스트는 리듬 유지력과 피로 영향을 보기 좋습니다."
          }
        },
        {
          "@type": "Question",
          name: "마우스와 터치 결과를 바로 비교할 수 있나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "권장하지 않습니다. 입력 하드웨어, 터치 샘플링, 브라우저 성능, 자세 차이 때문에 같은 사람도 다른 결과가 나올 수 있습니다."
          }
        },
        {
          "@type": "Question",
          name: "이 페이지는 클릭을 어떻게 계산하나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "선택한 시간 동안 기록된 기본 포인터 입력을 세고, 총 입력 수를 선택한 시간으로 나누어 CPS를 계산합니다."
          }
        }
      ]
    }
  ]
};

function replaceOrThrow(source, pattern, replacement, label) {
  const next = source.replace(pattern, replacement);
  if (next === source) {
    throw new Error(`Template replacement failed: ${label}`);
  }
  return next;
}

export async function onRequest(context) {
  const assetUrl = new URL("/", context.request.url);
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
  html = replaceOrThrow(html, /<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${KOREAN_ORIGIN}">`, "canonical");
  html = replaceOrThrow(html, /<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${KOREAN_ORIGIN}">`, "og:url");
  html = replaceOrThrow(html, /<meta property="og:locale" content="[^"]+">/, '<meta property="og:locale" content="ko_KR">', "og:locale");
  html = replaceOrThrow(html, /<meta property="og:locale:alternate" content="[^"]+">/, '<meta property="og:locale:alternate" content="en_US">', "og:locale alternate");
  html = replaceOrThrow(html, /<meta name="description" content="[^"]+">/, '<meta name="description" content="PC와 모바일에서 사용할 수 있는 무료 CPS 테스트와 가이드입니다. 점수 해석, 측정 방식, 정확도 팁, 안전 안내를 함께 제공합니다.">', "description");
  html = replaceOrThrow(html, /<meta property="og:title" content="[^"]+">/, '<meta property="og:title" content="NEONCPS | 무료 CPS 테스트와 가이드 (1초, 5초, 10초, 60초)">', "og:title");
  html = replaceOrThrow(html, /<meta property="og:description" content="[^"]+">/, '<meta property="og:description" content="PC와 모바일에서 사용할 수 있는 무료 CPS 테스트와 가이드입니다. 점수 해석, 측정 방식, 정확도 팁, 안전 안내를 함께 제공합니다.">', "og:description");
  html = replaceOrThrow(html, /<meta name="twitter:title" content="[^"]+">/, '<meta name="twitter:title" content="NEONCPS | 무료 CPS 테스트와 가이드 (1초, 5초, 10초, 60초)">', "twitter:title");
  html = replaceOrThrow(html, /<meta name="twitter:description" content="[^"]+">/, '<meta name="twitter:description" content="PC와 모바일에서 사용할 수 있는 무료 CPS 테스트와 가이드입니다. 점수 해석, 측정 방식, 정확도 팁, 안전 안내를 함께 제공합니다.">', "twitter:description");
  html = replaceOrThrow(html, /<title>[^<]+<\/title>/, '<title>NEONCPS | 무료 CPS 테스트와 가이드 (1초, 5초, 10초, 60초)</title>', "title");
  html = replaceOrThrow(html, /<body class="lang-en">/, '<body class="lang-ko">', "body lang");
  html = replaceOrThrow(
    html,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(koreanStructuredData, null, 2)}\n    </script>`,
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
