import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export const revalidate = 3600;

export default async function sitemap() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jaiwomensworld.com').replace(/\/+$/, '');
  let products = [];
  let categories = [];

  try {
    await dbConnect();
    [products, categories] = await Promise.all([
      Product.find({ isActive: true, slug: { $exists: true, $ne: '' } })
        .select('slug updatedAt')
        .sort({ updatedAt: -1 })
        .lean(),
      Category.find({ isActive: true, slug: { $exists: true, $ne: '' } })
        .select('slug updatedAt')
        .sort({ updatedAt: -1 })
        .lean(),
    ]);
  } catch (err) {
    console.error('Sitemap: failed to load products/categories', err);
  }

  const toDate = (d) => (d ? new Date(d) : undefined);

  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/combos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/bulk-enquiry`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const categoryRoutes = categories.map((c) => ({
    url: `${siteUrl}/category/${encodeURIComponent(c.slug)}`,
    lastModified: toDate(c.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${siteUrl}/product/${encodeURIComponent(p.slug)}`,
    lastModified: toDate(p.updatedAt),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
