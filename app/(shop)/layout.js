import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getNavCategories } from '@/lib/navCategories';

export default async function ShopLayout({ children }) {
  // Cached on the server, so the navbar needs no /api/categories call per visitor
  const categories = await getNavCategories();

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F0E9] text-[#171717]">
      <Navbar categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton phone="919500381414" />
    </div>
  );
}
