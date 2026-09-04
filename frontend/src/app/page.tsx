'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/boards');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
