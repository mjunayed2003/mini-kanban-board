'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { registerUser, clearAuthError } from '@/store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  // Pre-fill email if passed in query param (e.g. /register?email=user@example.com)
  useEffect(() => {
    dispatch(clearAuthError());
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryEmail = params.get('email');
      if (queryEmail) {
        setEmail(queryEmail);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      router.push('/boards');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (password.length < 6) {
      setClientError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setClientError('Passwords do not match. Please verify.');
      return;
    }

    dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
  };

  const activeError = clientError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/60">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-500/30 mb-3">
            📋
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Get started with FlowBoard in seconds
          </p>
        </div>

        {/* Registration Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-4"
        >
          {activeError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2 animate-fadeIn">
              <span className="text-base leading-none">❌</span>
              <span className="font-medium">{activeError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Alex Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              minLength={2}
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="alex@example.com"
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
              placeholder="•••••••• (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
              minLength={6}
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1 font-medium">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2.5 transition shadow-sm hover:shadow disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="pt-2 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
