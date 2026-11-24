import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, MapPin, Phone, Mail, Sparkles, ShieldCheck, HeartHandshake, Truck } from 'lucide-react';
import { dbConnect } from '@/lib/mongodb';
import Category from '@/models/Category';

export const revalidate = 3600;

async function getShopHref() {
  try {
    await dbConnect();
    const first = await Category.findOne({ isActive: true, parent: null })
      .sort({ sortOrder: 1, name: 1 })
      .select('slug')
      .lean();
    return first?.slug ? `/category/${first.slug}` : '/products';
  } catch {
    return '/products';
  }
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919500381414';
const PHONE_DISPLAY = '+91 9500381414';
const EMAIL = 'jaiwomensworld@gmail.com';

export const metadata = {
  title: 'About Us | Jai Womens World',
  description:
    "Discover the story of Jai Womens World, a premier women's fashion boutique in Tiruvannamalai, Tamil Nadu. Explore our curated kurtis, salwar sets, and dedication to timeless style.",
};

const VALUES = [
  {
    icon: Sparkles,
    title: 'Curated Boutique Designs',
    text: 'Every kurti, salwar set, and nighty is handpicked for impeccable fit, timeless silhouette, and everyday elegance.',
  },
  {
    icon: ShieldCheck,
    title: 'Fabric Quality First',
    text: 'We prioritize breathable pure cottons, fluid rayous, and skin-friendly textiles that look rich and feel effortless all day.',
  },
  {
    icon: HeartHandshake,
    title: 'Personalized Customer Care',
    text: 'Direct communication via WhatsApp for size guidance, styling queries, and custom order assistance.',
  },
  {
    icon: Truck,
    title: 'Pan-India Delivery',
    text: 'Swift and reliable packaging with door-step delivery across India and prompt tracking updates.',
  },
];

export default async function AboutPage() {
  const shopHref = await getShopHref();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hi Jai Womens World, I would like to enquire about your boutique collection.'
  )}`;

  return (
    <div className="bg-[#FFF4F3] min-h-screen">
      
      {/* Editorial Hero Banner */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-[#FFFFFF] to-[#FFF4F3] border-b border-[#F5D5DB]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B02F5E]/10 text-[#B02F5E] text-[10.5px] uppercase tracking-[0.25em] font-semibold">
            Our Story &amp; Philosophy
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#12233F] leading-tight">
            Welcome to <br />
            <span className="italic font-normal text-[#B02F5E]">Jai Womens World</span>
          </h1>

          <div className="w-12 h-0.5 bg-[#D9A441] mx-auto my-4" />

          <p className="text-sm sm:text-base text-[#7B5D69] max-w-2xl mx-auto leading-relaxed font-light">
            Founded in Tiruvannamalai, Tamil Nadu, Jai Womens World was born from a simple passion: to make sophisticated, comfortable, and celebratory women&rsquo;s fashion accessible to every home.
          </p>
        </div>
      </section>

      {/* Brand Identity / Story Section */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#F5D5DB] shadow-boutique bg-white flex items-center justify-center">
              <Image
                src="/Jai-logo.jpeg"
                alt="Jai Womens World Logo"
                fill
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#12233F]/90 to-transparent text-white text-center">
                <span className="font-display text-xl font-semibold block">JAI WOMENS WORLD</span>
                <span className="text-xs uppercase tracking-widest text-[#F4A7BA]">Tiruvannamalai, Tamil Nadu</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B02F5E] block">
              Crafted With Purpose
            </span>

            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#12233F] leading-snug">
              Every Stitch Tells a Tale of Grace
            </h2>

            <p className="text-sm sm:text-base text-[#7B5D69] font-light leading-relaxed">
              We understand that Indian women balance tradition and modernity with poise. Our collections reflect this duality — from classic straight-cut cotton kurtis to trending rayon umbrella silhouettes, salwar suit sets, and nighties designed for rest and relaxation.
            </p>

            <p className="text-sm sm:text-base text-[#7B5D69] font-light leading-relaxed">
              Every design is vetted for quality textiles, color fastness, and genuine value. We take pride in serving thousands of satisfied patrons across Tamil Nadu and throughout India with uncompromising honesty and warmth.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href={shopHref}
                className="px-8 py-3.5 rounded bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-all text-center shadow-boutique"
              >
                Explore The Collection
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded bg-white hover:bg-[#FCE4E8] text-[#12233F] border border-[#F5D5DB] text-xs uppercase tracking-[0.16em] font-semibold transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} />
                <span>Chat On WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 bg-white border-y border-[#F5D5DB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B02F5E] block mb-2">
              Why Choose Us
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#12233F]">
              The Jai Boutique Commitment
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-lg border border-[#F5D5DB] bg-[#FFF4F3]/30 hover:bg-[#FFF4F3]/70 hover:border-[#F4A7BA] transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#F5D5DB] mb-4 text-[#B02F5E] shadow-xs">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-[#12233F] mb-2">
                    {v.title}
                  </h3>
                  <p className="text-xs text-[#7B5D69] font-light leading-relaxed">
                    {v.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Boutique Visit & Contact Information */}
      <section className="py-20 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <div className="bg-white rounded-xl border border-[#F5D5DB] p-8 sm:p-12 shadow-card space-y-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B02F5E] block">
            Visit &amp; Connect
          </span>

          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#12233F]">
            Our Store Location
          </h2>

          <div className="space-y-3 text-sm text-[#171717] font-light max-w-md mx-auto pt-2">
            <div className="flex items-start justify-center gap-2.5">
              <MapPin size={17} className="text-[#B02F5E] shrink-0 mt-0.5" />
              <span>
                24, Chengam Road, 2nd Street,<br />
                Tiruvannamalai, Tamil Nadu – 606601, India.
              </span>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <Phone size={15} className="text-[#D9A441] shrink-0" />
              <a href={`tel:${WHATSAPP_NUMBER}`} className="hover:text-[#B02F5E] transition-colors font-medium">
                {PHONE_DISPLAY}
              </a>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <Mail size={15} className="text-[#D9A441] shrink-0" />
              <a href={`mailto:${EMAIL}`} className="hover:text-[#B02F5E] transition-colors font-medium">
                {EMAIL}
              </a>
            </div>
          </div>

          <div className="pt-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-all shadow-boutique"
            >
              <MessageCircle size={15} />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
