'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser, clearAuthError } from '@/store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      router.push('/boards');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/60">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-500/30 mb-3">
            📋
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to access your Kanban boards
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-4"
        >
          {error && (
            <div
              className={`p-3.5 rounded-xl text-sm border flex flex-col gap-1.5 animate-fadeIn ${
                error.toLowerCase().includes('register')
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{error.toLowerCase().includes('register') ? '⚠️' : '❌'}</span>
                <span className="font-medium">{error}</span>
              </div>
              {error.toLowerCase().includes('register') && (
                <Link
                  href={`/register?email=${encodeURIComponent(email)}`}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline mt-1 inline-flex items-center gap-1"
                >
                  👉 Click here to register with {email || 'this email'}
                </Link>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2.5 transition shadow-sm hover:shadow disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="pt-2 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
