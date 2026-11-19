'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MessageCircle } from 'lucide-react';

function AccordionSection({ id, title, openSection, onToggle, children }) {
  const isOpen = openSection === id;
  return (
    <div className="border-b border-[#F5F0E9]/10 sm:border-0">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between py-4 sm:py-0 sm:mb-4 sm:pointer-events-none sm:cursor-default"
      >
        <span className="font-medium text-xs tracking-[0.2em] uppercase text-[#BFA078]">
          {title}
        </span>
        <ChevronDown
          size={14}
          className="sm:hidden transition-transform duration-200 text-[#D8B5A9]"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <div className={`${isOpen ? 'block' : 'hidden'} sm:!block pb-4 sm:pb-0`}>
        {children}
      </div>
    </div>
  );
}

export default function FooterLinks({
  categories = [],
  navLinks = [],
  supportLinks = [],
  phone,
  phoneDigits,
  email,
}) {
  const [openSection, setOpenSection] = useState(null);
  const toggle = (id) => setOpenSection((prev) => (prev === id ? null : id));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-8">
      {/* Categories */}
      <div>
        <AccordionSection id="categories" title="Categories" openSection={openSection} onToggle={toggle}>
          <ul className="space-y-2.5 text-sm font-light text-[#F5F0E9]/80">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="hover:text-white hover:translate-x-1 inline-block transition-all"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/products"
                className="text-[#B98270] hover:text-[#D8B5A9] font-normal inline-block transition-colors text-xs tracking-wider uppercase mt-1"
              >
                View All &rarr;
              </Link>
            </li>
          </ul>
        </AccordionSection>
      </div>

      {/* Explore */}
      <div>
        <AccordionSection id="explore" title="Explore" openSection={openSection} onToggle={toggle}>
          <ul className="space-y-2.5 text-sm font-light text-[#F5F0E9]/80">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-white hover:translate-x-1 inline-block transition-all"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </AccordionSection>
      </div>

      {/* Customer Care */}
      <div>
        <AccordionSection id="care" title="Customer Care" openSection={openSection} onToggle={toggle}>
          <ul className="space-y-2.5 text-sm font-light text-[#F5F0E9]/80">
            {supportLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-white hover:translate-x-1 inline-block transition-all"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <a
                href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent('Hi Jai Womens World, I have an enquiry.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#B98270] hover:bg-[#9F6A5B] text-white text-xs font-medium transition-colors"
              >
                <MessageCircle size={13} />
                <span>WhatsApp Us</span>
              </a>
            </li>
          </ul>
        </AccordionSection>
      </div>
    </div>
  );
}
