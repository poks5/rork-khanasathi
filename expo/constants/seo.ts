export const seoConfig = {
  title: 'Khanasathi - CKD Nutrition Guide',
  description: 'Complete nutrition guide for Chronic Kidney Disease (CKD) patients in Nepal. Track nutrients, get personalized recommendations, and manage your diet with traditional Nepali foods.',
  keywords: 'CKD nutrition, kidney disease diet, Nepal nutrition, dialysis diet, potassium phosphorus sodium tracking, Nepali food nutrition, chronic kidney disease management',
  author: 'Khanasathi Team',
  url: 'https://rork.com/',
  image: 'https://rork.com/assets/images/icon.png',
  themeColor: '#2563eb',
  backgroundColor: '#ffffff',
  locale: 'en_US',
  alternateLocale: 'ne_NP',
  twitterHandle: '@khanasathi',
  siteName: 'Khanasathi',
  type: 'website'
};

export const generateMetaTags = () => {
  if (typeof document === 'undefined') return;
  
  // Set document title
  document.title = seoConfig.title;
  
  // Create or update meta tags
  const metaTags = [
    { name: 'description', content: seoConfig.description },
    { name: 'keywords', content: seoConfig.keywords },
    { name: 'author', content: seoConfig.author },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    { name: 'theme-color', content: seoConfig.themeColor },
    { name: 'msapplication-TileColor', content: seoConfig.themeColor },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'Khanasathi' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    
    // Open Graph tags
    { property: 'og:title', content: seoConfig.title },
    { property: 'og:description', content: seoConfig.description },
    { property: 'og:type', content: seoConfig.type },
    { property: 'og:url', content: seoConfig.url },
    { property: 'og:image', content: seoConfig.image },
    { property: 'og:locale', content: seoConfig.locale },
    { property: 'og:locale:alternate', content: seoConfig.alternateLocale },
    { property: 'og:site_name', content: seoConfig.siteName },
    
    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoConfig.title },
    { name: 'twitter:description', content: seoConfig.description },
    { name: 'twitter:image', content: seoConfig.image },
    { name: 'twitter:site', content: seoConfig.twitterHandle },
    { name: 'twitter:creator', content: seoConfig.twitterHandle },
    
    // Additional SEO tags
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { name: 'googlebot', content: 'index, follow' },
    { name: 'bingbot', content: 'index, follow' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'HandheldFriendly', content: 'true' },
    { name: 'MobileOptimized', content: '320' },
  ];
  
  metaTags.forEach(({ name, property, content }) => {
    const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      if (name) meta.name = name;
      if (property) meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  });
  
  // Add canonical link
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = seoConfig.url;
  
  // Add alternate language links
  const alternateLinks = [
    { hreflang: 'en', href: seoConfig.url },
    { hreflang: 'ne', href: seoConfig.url + '?lang=ne' },
    { hreflang: 'x-default', href: seoConfig.url }
  ];
  
  alternateLinks.forEach(({ hreflang, href }) => {
    let alternate = document.querySelector(`link[hreflang="${hreflang}"]`) as HTMLLinkElement;
    if (!alternate) {
      alternate = document.createElement('link');
      alternate.rel = 'alternate';
      alternate.hreflang = hreflang;
      document.head.appendChild(alternate);
    }
    alternate.href = href;
  });
  
  // Add structured data (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': seoConfig.siteName,
    'description': seoConfig.description,
    'url': seoConfig.url,
    'image': seoConfig.image,
    'author': {
      '@type': 'Organization',
      'name': seoConfig.author
    },
    'applicationCategory': 'HealthApplication',
    'operatingSystem': 'Web, iOS, Android',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'inLanguage': ['en', 'ne'],
    'audience': {
      '@type': 'MedicalAudience',
      'audienceType': 'Patients with Chronic Kidney Disease'
    },
    'medicalSpecialty': 'Nephrology',
    'about': {
      '@type': 'MedicalCondition',
      'name': 'Chronic Kidney Disease',
      'alternateName': 'CKD'
    }
  };
  
  let jsonLd = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
  if (!jsonLd) {
    jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    document.head.appendChild(jsonLd);
  }
  jsonLd.textContent = JSON.stringify(structuredData);
};