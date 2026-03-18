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

  const body = document.body;
  const langToggle = document.getElementById('langToggle');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

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

  function setLanguage(lang) {
    const nextLang = lang === 'ko' ? 'ko' : 'en';
    body.classList.toggle('lang-ko', nextLang === 'ko');
    body.classList.toggle('lang-en', nextLang === 'en');
    document.documentElement.setAttribute('lang', nextLang);
    safeStorageSet('neon_lang', nextLang);
    applyTranslations(nextLang);
  }

  function detectDefaultLang() {
    const stored = safeStorageGet('neon_lang', '');
    if (stored === 'ko' || stored === 'en') return stored;

    const referrer = document.referrer || '';
    if (referrer.startsWith('https://neoncps.com/ko/')) return 'ko';

    const docLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (docLang.startsWith('ko')) return 'ko';

    return (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  }

  function setTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    body.classList.toggle('light', nextTheme === 'light');
    safeStorageSet('neon_theme', nextTheme);
    updateThemeIcon();
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const isKorean = body.classList.contains('lang-ko');
      setLanguage(isKorean ? 'en' : 'ko');
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
