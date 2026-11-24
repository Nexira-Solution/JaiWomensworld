export default function robots() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jaiwomensworld.com').replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/cart',
          '/checkout',
          '/account',
          '/login',
          '/register',
          '/orders',
          '/*?*sort=',
          '/*?*filter=',
          '/*?*utm_',
          '/*?*sessionid=',
        ],
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'ClaudeBot', 'Bytespider', 'Amazonbot', 'PerplexityBot', 'anthropic-ai'],
        disallow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
