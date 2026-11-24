import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import BottomNav from '@/components/BottomNav';
import { getNavCategories } from '@/lib/navCategories';

export default async function ShopLayout({ children }) {
  // Cached on the server, so the navbar needs no /api/categories call per visitor
  const categories = await getNavCategories();

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF4F3] text-[#1E1520]">
      <Navbar categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton phone="919500381414" />
      <BottomNav />
    </div>
  );
}
