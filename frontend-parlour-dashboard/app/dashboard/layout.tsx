'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getNavItems = () => {
    if (user?.role === 'super_admin') {
      return [
        { href: '/dashboard/super-admin', label: 'Dashboard', icon: '📊' },
        { href: '/dashboard/super-admin/users', label: 'User Management', icon: '🔑' },
        { href: '/dashboard/super-admin/employees', label: 'Employees', icon: '👥' },
        { href: '/dashboard/super-admin/tasks', label: 'Tasks', icon: '📋' },
        { href: '/dashboard/super-admin/attendance', label: 'Attendance', icon: '⏰' },
      ];
    } else if (user?.role === 'admin') {
      return [
        { href: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
        { href: '/dashboard/admin/employees', label: 'Employees', icon: '👥' },
        { href: '/dashboard/admin/tasks', label: 'Tasks', icon: '📋' },
        { href: '/dashboard/admin/attendance-logs', label: 'Attendance Logs', icon: '📋' },
      ];
    } else {
      return [
        { href: '/dashboard/employee', label: 'Dashboard', icon: '📊' },
        { href: '/dashboard/employee/tasks', label: 'Tasks', icon: '📋' },
        { href: '/dashboard/employee/attendance-logs', label: 'Attendance Logs', icon: '📋' },
      ];
    }
  };

  const navItems = getNavItems();
  const isActivePath = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Toggle Button for Mobile */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-purple-600
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-4">
          <Link 
            href={`/dashboard/${user?.role === 'super_admin' ? 'super-admin' : user?.role === 'admin' ? 'admin' : 'employee'}`}
            className="flex items-center space-x-3"
          >
            <div className="bg-white/10 p-2 rounded-lg">
              <span className="text-2xl">💄</span>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">Parlour Pro</h1>
              <p className="text-xs opacity-80">Management System</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${isActivePath(item.href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link
                href="/attendance"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium
                         text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                <span className="text-xl">🖥️</span>
                <span>Punch Station</span>
              </Link>
            )}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-white mb-4">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm opacity-80">
              <span className="mr-1">
                {user?.role === 'super_admin' ? '👑' : user?.role === 'admin' ? '👤' : '👨‍💼'}
              </span>
              {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Employee'}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 
                     text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        {children}
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
