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
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F5F0E9] text-xs uppercase tracking-wider text-[#77716F]">
        Retrieving order confirmation…
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0E9] min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full bg-white rounded-xl border border-[#E9DFD9] p-8 sm:p-12 text-center shadow-card">
        <div className="w-16 h-16 rounded-full bg-[#F4E8E3] border border-[#BFA078]/40 flex items-center justify-center mx-auto mb-6 text-[#B98270]">
          <CheckCircle2 size={32} strokeWidth={1.75} />
        </div>

        <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[#B98270] block mb-1">
          Order Confirmed
        </span>

        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#172333]">
          Thank You For Shopping With Us
        </h1>

        <div className="mt-6 pt-6 border-t border-[#E9DFD9] max-w-xs mx-auto space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-[#77716F]">
            <span>Order Number:</span>
            <span className="font-semibold text-[#172333]">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-[#77716F]">
            <span>Total Paid:</span>
            <span className="font-semibold text-[#172333]">{formatINR(order.total)}</span>
          </div>
        </div>

        <p className="text-xs text-[#77716F] mt-6 font-light leading-relaxed">
          We have sent your confirmation and tracking details to <strong className="text-[#172333] font-medium">{order.customer?.phone}</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 pt-6 border-t border-[#E9DFD9]">
          <Link
            href={`/invoice/${order._id}`}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded border border-[#172333] text-[#172333] text-xs font-semibold uppercase tracking-wider hover:bg-[#F5F0E9] transition-colors"
          >
            <FileText size={14} />
            <span>View Invoice</span>
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded bg-[#172333] hover:bg-[#B98270] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-boutique"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
