'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

const INK = '#171717';
const INK_SOFT = '#77716F';
const LINE = '#E9DFD9';
const PAPER = '#F5F0E9';
const NAVY = '#172333';
const ROSE = '#B98270';

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
        className="w-full max-w-[380px] bg-white rounded-xl border border-[#E9DFD9] p-8 shadow-card"
      >
        <div className="text-center mb-7">
          <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border border-[#E9DFD9] bg-white shadow-xs">
            <Image src="/Jai-logo.jpeg" alt="Jai Womens World" fill sizes="64px" className="object-cover" priority />
          </div>
          <h1 className="font-display text-xl font-semibold text-[#172333]">
            Jai Womens World
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#B98270] font-medium mt-1">
            Boutique Administration
          </p>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#77716F] mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="admin@jaiwomensworld.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F5F0E9]/40 outline-none transition-colors border border-[#E9DFD9] rounded focus:border-[#172333] text-[#171717]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#77716F] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F5F0E9]/40 outline-none transition-colors border border-[#E9DFD9] rounded focus:border-[#172333] text-[#171717]"
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full mt-6 py-3 rounded text-xs uppercase tracking-wider font-semibold text-white transition-all shadow-boutique bg-[#172333] hover:bg-[#B98270] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Authenticating…' : 'Sign In to Dashboard'}
        </button>
      </form>
    </div>
  );
}
