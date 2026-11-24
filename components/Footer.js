import { MapPin, Phone, Mail, Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { dbConnect } from '@/lib/mongodb';
import Category from '@/models/Category';
import Settings from '@/models/Settings';
import FooterLinks from './FooterLinks';

async function getFooterData() {
  try {
    await dbConnect();
    const [categories, settings] = await Promise.all([
      Category.find({ isActive: true, parent: null })
        .select('name slug')
        .sort({ sortOrder: 1, name: 1 })
        .limit(8)
        .lean(),
      Settings.findOne({ key: 'global' }).lean(),
    ]);

    return {
      categories: JSON.parse(JSON.stringify(categories || [])),
      settings: JSON.parse(JSON.stringify(settings || {})),
    };
  } catch (err) {
    console.error('Error fetching footer data:', err?.message || err);
    return { categories: [], settings: {} };
  }
}

export default async function Footer() {
  const { categories, settings } = await getFooterData();

  // Dynamic values connected to admin settings (/admin/settings)
  const storeName = settings?.storeName || 'JAI WOMENS WORLD';
  const tagline = settings?.tagline || "Women's Fashion Boutique";
  const address = settings?.address || '24, Chengam Road, 2nd Street, Tiruvannamalai, Tamil Nadu – 606601, India.';
  const rawPhone = settings?.whatsapp || settings?.phone || '919500381414';
  const phoneDigits = String(rawPhone).replace(/\D/g, '');
  const displayPhone = settings?.phone ? `+91 ${settings.phone.replace(/^91/, '')}` : '+91 9500381414';
  const email = settings?.email || 'jaiwomensworld@gmail.com';
  const instagram = settings?.instagram || '';

  function formatAddressLines(addr) {
    if (!addr) return [];
    const parts = addr.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length <= 2) return parts;
    const mid = Math.ceil(parts.length / 2);
    const line1 = parts.slice(0, mid).join(', ') + ',';
    const line2 = parts.slice(mid).join(', ');
    return [line1, line2];
  }

  const addressLines = formatAddressLines(address);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Collections', href: '/products' },
    { label: 'Combo Offers', href: '/combo' },
    { label: 'About Us', href: '/about' },
    { label: 'Bulk Enquiry', href: '/bulk-enquiry' },
  ];

  const supportLinks = [
    { label: 'Track Order', href: '/orders' },
    { label: 'Shopping Bag', href: '/cart' },
    { label: 'My Wishlist', href: '/wishlist' },
    { label: 'Shipping & Delivery', href: '/about' },
  ];

  return (
    <footer className="relative mt-24 text-[#FFF4F3]" style={{ background: 'linear-gradient(165deg, #12233F 0%, #2A1233 60%, #4A0F28 130%)' }}>
      {/* silk wave that lifts the footer out of the page */}
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 -top-[59px] h-[60px] w-full" aria-hidden="true">
        <path d="M0 60 L0 30 C240 -10 480 70 760 30 C1020 -6 1240 10 1440 34 L1440 60 Z" fill="#12233F" />
        <path d="M0 30 C240 -10 480 70 760 30 C1020 -6 1240 10 1440 34" fill="none" stroke="#D9A441" strokeOpacity=".7" strokeWidth="2" />
      </svg>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-28 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand Column — Connected to Admin Settings */}
          <div className="md:col-span-4 lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[#D9A441] shadow-md">
                <Image
                  src="/Jai-logo.jpeg"
                  alt={storeName}
                  fill
                  sizes="48px"
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <span className="font-display text-2xl sm:text-3xl font-bold tracking-[0.03em] text-white block">
                  {storeName}
                </span>
                <span className="block text-xs sm:text-[13px] tracking-wide text-[#F6D573] mt-0.5 font-medium">
                  {tagline}
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-[#FFD3DE]/85 max-w-sm">
              A refined celebration of modern and traditional women&rsquo;s wear. Thoughtfully designed kurtis,
              salwar suits and daily comforts crafted for effortless elegance.
            </p>

            {/* Address & Contacts — Connected to Admin Settings */}
            <div className="pt-2 space-y-2.5 text-xs text-[#FFF4F3]/80 font-light">
              {address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 hover:text-white transition-colors"
                >
                  <MapPin size={15} className="shrink-0 mt-0.5 text-[#D9A441]" />
                  <span className="leading-relaxed">
                    {addressLines.length > 0 ? (
                      addressLines.map((line, idx) => (
                        <span key={idx} className="block">{line}</span>
                      ))
                    ) : (
                      <span>{address}</span>
                    )}
                  </span>
                </a>
              )}

              {displayPhone && (
                <a
                  href={`tel:${phoneDigits}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Phone size={14} className="shrink-0 text-[#D9A441]" />
                  <span>{displayPhone}</span>
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Mail size={14} className="shrink-0 text-[#D9A441]" />
                  <span>{email}</span>
                </a>
              )}

              {instagram && (
                <a
                  href={`https://instagram.com/${instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Instagram size={14} className="shrink-0 text-[#D9A441]" />
                  <span>@{instagram.replace('@', '')}</span>
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Accordion / Column Links */}
          <div className="md:col-span-8 lg:col-span-7">
            <FooterLinks
              categories={categories}
              navLinks={navLinks}
              supportLinks={supportLinks}
              phone={displayPhone}
              phoneDigits={phoneDigits}
              email={email}
            />
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-[#FFF4F3]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F4A7BA]/70 font-light">
          <p>
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>

          <a
            href="https://www.nexirasolution.in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-100 opacity-80"
          >
            <span>Crafted by</span>
            <span className="font-medium text-[#D9A441]">Nexira Solution</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
