'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // Show loading spinner while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mb-4">
          💄
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Parlour Dashboard</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-white mt-4">Loading...</p>
      </div>
    </div>
  );
}
