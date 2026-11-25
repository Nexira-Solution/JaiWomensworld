import './globals.css';
import { unstable_cache } from 'next/cache';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/components/CartContext';
import { WishlistProvider } from '@/components/WhishlistContext';
import { FlipCardProvider } from '@/components/FlipCardContext';
import { dbConnect } from '@/lib/mongodb';
import Settings from '@/models/Settings';

const SITE_NAME = 'Jai Womens World';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jaiwomensworld.com';
const DEFAULT_TITLE = "Jai Womens World | Premium Women's Fashion Boutique";
const DEFAULT_DESCRIPTION =
  "Discover timeless women's fashion at Jai Womens World. Thoughtfully curated kurtis, salwar sets, nighties and chic ethnic boutique collections in Tiruvannamalai, Tamil Nadu.";
const DEFAULT_OG_IMAGE = '/Jai-logo.jpeg';

// Cached for 1 hour. Call revalidateTag('settings') after saving settings in admin.
const getSeoSettings = unstable_cache(
  async () => {
    try {
      await dbConnect();
      const s = await Settings.findOne({ key: 'global' })
        .select('seoTitle seoDescription storeName')
        .lean();
      return s
        ? {
            seoTitle: s.seoTitle || null,
            seoDescription: s.seoDescription || null,
            storeName: s.storeName || SITE_NAME,
          }
        : null;
    } catch {
      return null;
    }
  },
  ['global-seo-settings'],
  { revalidate: 3600, tags: ['settings'] }
);

export async function generateMetadata() {
  const settings = await getSeoSettings();

  const title = settings?.seoTitle || DEFAULT_TITLE;
  const description = settings?.seoDescription || DEFAULT_DESCRIPTION;
  const brandName = settings?.storeName || SITE_NAME;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${brandName}` },
    description,
    applicationName: brandName,
    keywords: [
      "women's clothing",
      "women's fashion boutique",
      "ethnic wear for women",
      'salwar set online',
      'kurtis online',
      'nighties collection',
      'boutique shopping Tiruvannamalai',
      'women fashion store Tamil Nadu',
      'Jai Womens World',
    ],
    authors: [{ name: brandName, url: SITE_URL }],
    creator: brandName,
    publisher: brandName,
    category: 'fashion',
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/Jai-logo.jpeg', type: 'image/jpeg' },
      ],
      shortcut: ['/favicon.ico'],
      apple: [{ url: '/Jai-logo.jpeg' }],
    },
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: brandName,
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 800,
          height: 800,
          alt: `${brandName} - Premium Women's Fashion Boutique`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
      : undefined,
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFF4F3',
};

// Structured data (JSON-LD) for Google search indexation
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/Jai-logo.jpeg`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-9500381414',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Tamil'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'en-IN',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'ClothingStore',
      '@id': `${SITE_URL}/#store`,
      name: SITE_NAME,
      url: SITE_URL,
      image: `${SITE_URL}/Jai-logo.jpeg`,
      telephone: '+91-9500381414',
      email: 'jaiwomensworld@gmail.com',
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '24, Chengam Road, 2nd Street',
        addressLocality: 'Tiruvannamalai',
        addressRegion: 'Tamil Nadu',
        postalCode: '606601',
        addressCountry: 'IN',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="icon" href="/icon.png?v=3" type="image/png" sizes="192x192" />
        <link rel="icon" href="/Jai-logo.jpeg?v=3" type="image/jpeg" />
        <link rel="shortcut icon" href="/Jai-logo.jpeg?v=3" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/icon.png?v=3" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased selection:bg-[#B02F5E] selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />

        <CartProvider>
          <WishlistProvider>
            <FlipCardProvider>
              {children}
            </FlipCardProvider>
          </WishlistProvider>
        </CartProvider>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              background: '#FFFFFF',
              color: '#171717',
              border: '1px solid #F5D5DB',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              boxShadow: '0 8px 24px rgba(18,35,63,0.08)',
            },
            success: {
              iconTheme: { primary: '#B02F5E', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#C2384F', secondary: '#FFFFFF' },
            },
          }}
        />
      </body>
    </html>
  );
}
