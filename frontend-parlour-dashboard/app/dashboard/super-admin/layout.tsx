'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isSuperAdmin } from '@/utils/auth';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !isSuperAdmin())) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user || !isSuperAdmin()) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-900">Super Admin Dashboard</h1>
        <p className="text-purple-600 mt-2">Manage your entire salon system from here</p>
      </div>
      {children}
    </div>
  );
} 