'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

const INK = '#171717';
const INK_SOFT = '#7B5D69';
const LINE = '#F5D5DB';
const PAPER = '#FFF4F3';
const NAVY = '#12233F';
const ROSE = '#B02F5E';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      toast.error(data.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: PAPER }}>
      <form
        onSubmit={submit}
        className="w-full max-w-[380px] bg-white rounded-xl border border-[#F5D5DB] p-8 shadow-card"
      >
        <div className="text-center mb-7">
          <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border border-[#F5D5DB] bg-white shadow-xs">
            <Image src="/Jai-logo.jpeg" alt="Jai Womens World" fill sizes="64px" className="object-cover" priority />
          </div>
          <h1 className="font-display text-xl font-semibold text-[#12233F]">
            Jai Womens World
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#B02F5E] font-medium mt-1">
            Boutique Administration
          </p>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="admin@jaiwomensworld.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFF4F3]/40 outline-none transition-colors border border-[#F5D5DB] rounded focus:border-[#12233F] text-[#171717]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFF4F3]/40 outline-none transition-colors border border-[#F5D5DB] rounded focus:border-[#12233F] text-[#171717]"
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full mt-6 py-3 rounded text-xs uppercase tracking-wider font-semibold text-white transition-all shadow-boutique bg-[#12233F] hover:bg-[#B02F5E] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Authenticating…' : 'Sign In to Dashboard'}
        </button>
      </form>
    </div>
  );
}
