(function () {
  if (window.location.hostname !== 'neoncps.com' || window.__neonTrackingLoaded) return;
  window.__neonTrackingLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  const consentRequiredRegions = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'
  ];

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    region: consentRequiredRegions,
    wait_for_update: 500
  });

  window.gtag('consent', 'default', {
    ad_storage: 'granted',
    analytics_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  });

  const analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-QXBYS7FWMH';
  document.head.appendChild(analyticsScript);
  window.gtag('js', new Date());
  window.gtag('config', 'G-QXBYS7FWMH');

  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };

  function loadClarityWhenIdle() {
    if (window.__clarityLoaded) return;
    window.__clarityLoaded = true;
    const clarityScript = document.createElement('script');
    clarityScript.async = true;
    clarityScript.src = 'https://www.clarity.ms/tag/vk5zr5rhoj';
    document.head.appendChild(clarityScript);
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadClarityWhenIdle, { timeout: 2500 });
  } else {
    window.addEventListener('load', function () {
      window.setTimeout(loadClarityWhenIdle, 1200);
    }, { once: true });
  }
})();
