export const sitemapConfig = {
  baseUrl: 'https://rork.com',
  routes: [
    {
      path: '/',
      priority: 1.0,
      changefreq: 'daily',
      lastmod: new Date().toISOString(),
      alternates: [
        { lang: 'en', href: '/' },
        { lang: 'ne', href: '/?lang=ne' }
      ]
    },
    {
      path: '/foods',
      priority: 0.9,
      changefreq: 'weekly',
      lastmod: new Date().toISOString(),
      alternates: [
        { lang: 'en', href: '/foods' },
        { lang: 'ne', href: '/foods?lang=ne' }
      ]
    },
    {
      path: '/log',
      priority: 0.8,
      changefreq: 'daily',
      lastmod: new Date().toISOString(),
      alternates: [
        { lang: 'en', href: '/log' },
        { lang: 'ne', href: '/log?lang=ne' }
      ]
    },
    {
      path: '/insights',
      priority: 0.8,
      changefreq: 'weekly',
      lastmod: new Date().toISOString(),
      alternates: [
        { lang: 'en', href: '/insights' },
        { lang: 'ne', href: '/insights?lang=ne' }
      ]
    },
    {
      path: '/profile',
      priority: 0.7,
      changefreq: 'monthly',
      lastmod: new Date().toISOString(),
      alternates: [
        { lang: 'en', href: '/profile' },
        { lang: 'ne', href: '/profile?lang=ne' }
      ]
    }
  ]
};

export const generateSitemap = (): string => {
  const { baseUrl, routes } = sitemapConfig;
  
  const urlEntries = routes.map(route => {
    const alternateLinks = route.alternates
      .map(alt => `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${baseUrl}${alt.href}" />`)
      .join('\n');
    
    return `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
${alternateLinks}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
};

export const generateRobotsTxt = (): string => {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${sitemapConfig.baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Block access to sensitive areas (if any)
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /`;
};