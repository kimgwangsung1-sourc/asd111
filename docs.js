(function () {
  function safeStorageGet(key, fallbackValue) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallbackValue : value;
    } catch (err) {
      return fallbackValue;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      // ignore storage errors
    }
  }

  const translations = {
    en: {
      langButton: 'LANG',
      theme: 'THEME'
    },
    ko: {
      langButton: '언어',
      theme: '테마'
    }
  };

  const root = document.documentElement;
  const body = document.body;
  const langToggle = document.getElementById('langToggle');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const localizedPaths = new Set([
    '/',
    '/guides/',
    '/guides/how-neoncps-measures-cps/',
    '/guides/why-cps-scores-change/',
    '/guides/mobile-vs-mouse-cps/',
    '/guides/safe-cps-practice/',
    '/about/',
    '/editorial-policy/'
  ]);

  function updateThemeIcon() {
    if (!themeIcon) return;
    themeIcon.textContent = body.classList.contains('light') ? '☀️' : '🌙';
  }

  function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = (translations[lang] && translations[lang][key]) || key;
    });
  }

  function updateLocalizedLinks(lang) {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('/')) return;

      try {
        const url = new URL(href, window.location.origin);
        const englishPath = url.pathname.startsWith('/ko/')
          ? url.pathname.slice(3)
          : url.pathname;

        if (!localizedPaths.has(englishPath)) return;

        url.pathname = lang === 'ko'
          ? (englishPath === '/' ? '/ko/' : `/ko${englishPath}`)
          : englishPath;
        link.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
      } catch (err) {
        // Keep the original link if it cannot be parsed.
      }
    });
  }

  function setLanguage(lang) {
    const nextLang = lang === 'ko' ? 'ko' : 'en';
    root.classList.toggle('lang-ko', nextLang === 'ko');
    root.classList.toggle('lang-en', nextLang === 'en');
    body.classList.toggle('lang-ko', nextLang === 'ko');
    body.classList.toggle('lang-en', nextLang === 'en');
    root.setAttribute('lang', nextLang);
    safeStorageSet('neon_lang', nextLang);
    applyTranslations(nextLang);
    updateLocalizedLinks(nextLang);
  }

  function detectDefaultLang() {
    const path = window.location.pathname || '';
    return path === '/ko' || path.startsWith('/ko/') ? 'ko' : 'en';
  }

  function setTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    root.classList.toggle('light', nextTheme === 'light');
    body.classList.toggle('light', nextTheme === 'light');
    safeStorageSet('neon_theme', nextTheme);
    updateThemeIcon();
  }

  function findAlternateLanguageUrl(lang) {
    const selector = `link[rel="alternate"][hreflang="${lang}"]`;
    const link = document.querySelector(selector);

    if (!link) return '';

    const href = link.getAttribute('href') || '';
    if (!href) return '';

    try {
      const nextUrl = new URL(href, window.location.href);
      return nextUrl.toString() === window.location.href ? '' : nextUrl.toString();
    } catch (err) {
      return '';
    }
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const isKorean = body.classList.contains('lang-ko');
      const nextLang = isKorean ? 'en' : 'ko';
      const alternateUrl = findAlternateLanguageUrl(nextLang);

      safeStorageSet('neon_lang', nextLang);

      if (alternateUrl) {
        window.location.href = alternateUrl;
        return;
      }

      setLanguage(nextLang);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = body.classList.contains('light');
      setTheme(isLight ? 'dark' : 'light');
    });
  }

  setTheme(safeStorageGet('neon_theme', 'dark'));
  setLanguage(detectDefaultLang());
})();
