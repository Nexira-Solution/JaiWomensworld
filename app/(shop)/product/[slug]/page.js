import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getProductPageData } from '@/lib/products';
import { toCardProduct } from '@/lib/cardProduct';
import ProductClient from './ProductClient';

export const revalidate = 600;

const getData = cache(getProductPageData);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const data = await getData(slug);
    if (!data?.product) return {};
    const firstImage = data.product.variants?.[0]?.images?.[0] || '/Jai-logo.jpeg';
    const price = data.product.basePrice || data.product.variants?.[0]?.price || 0;

    return {
      title: `${data.product.name} | Jai Womens World`,
      description:
        data.product.description?.slice(0, 160) ||
        `Explore ${data.product.name} at Jai Womens World. Premium quality women's boutique fashion in Tiruvannamalai, Tamil Nadu. Fast delivery across India.`,
      openGraph: {
        title: `${data.product.name} | Jai Womens World`,
        description: data.product.description?.slice(0, 160),
        images: [firstImage],
      },
      other: {
        'product:price:amount': String(price),
        'product:price:currency': 'INR',
      },
    };
  } catch {
    return {
      title: 'Product | Jai Womens World',
    };
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  let data = null;
  try {
    data = await getData(slug);
  } catch (err) {
    console.error('Error loading product page:', err?.message || err);
  }
  if (!data?.product) notFound();

  const trimmed = { ...data, related: (data.related || []).map(toCardProduct) };

  // JSON-LD Product Schema
  const firstVariant = data.product.variants?.[0];
  const price = data.product.basePrice || firstVariant?.price || 0;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.product.name,
    image: firstVariant?.images || ['/Jai-logo.jpeg'],
    description: data.product.description || `Handcrafted women's fashion design by Jai Womens World.`,
    brand: {
      '@type': 'Brand',
      name: 'Jai Womens World',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: price,
      availability:
        firstVariant?.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Jai Womens World',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, '\\u003c'),
        }}
      />
      <ProductClient data={trimmed} />
    </>
  );
}
