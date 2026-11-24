'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, PackageCheck, ArrowRight, FileText } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order));
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FFF4F3] text-xs uppercase tracking-wider text-[#7B5D69]">
        Retrieving order confirmation…
      </div>
    );
  }

  return (
    <div className="bg-[#FFF4F3] min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full bg-white rounded-xl border border-[#F5D5DB] p-8 sm:p-12 text-center shadow-card">
        <div className="w-16 h-16 rounded-full bg-[#FCE4E8] border border-[#D9A441]/40 flex items-center justify-center mx-auto mb-6 text-[#B02F5E]">
          <CheckCircle2 size={32} strokeWidth={1.75} />
        </div>

        <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[#B02F5E] block mb-1">
          Order Confirmed
        </span>

        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#12233F]">
          Thank You For Shopping With Us
        </h1>

        <div className="mt-6 pt-6 border-t border-[#F5D5DB] max-w-xs mx-auto space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-[#7B5D69]">
            <span>Order Number:</span>
            <span className="font-semibold text-[#12233F]">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-[#7B5D69]">
            <span>Total Paid:</span>
            <span className="font-semibold text-[#12233F]">{formatINR(order.total)}</span>
          </div>
        </div>

        <p className="text-xs text-[#7B5D69] mt-6 font-light leading-relaxed">
          We have sent your confirmation and tracking details to <strong className="text-[#12233F] font-medium">{order.customer?.phone}</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 pt-6 border-t border-[#F5D5DB]">
          <Link
            href={`/invoice/${order._id}`}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded border border-[#12233F] text-[#12233F] text-xs font-semibold uppercase tracking-wider hover:bg-[#FFF4F3] transition-colors"
          >
            <FileText size={14} />
            <span>View Invoice</span>
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-boutique"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
