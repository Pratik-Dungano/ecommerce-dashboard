'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { isSuperAdmin } from '../utils/auth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActivePath = (path: string) => pathname === path;

  // Define navigation items based on user role
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
        { href: '/dashboard/admin/attendance', label: 'Attendance', icon: '⏰' },
      ];
    } else {
      return [
        { href: '/dashboard/employee', label: 'Dashboard', icon: '📊' },
        { href: '/dashboard/employee/tasks', label: 'Tasks', icon: '📋' },
        { href: '/dashboard/employee/attendance', label: 'Attendance', icon: '⏰' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href={`/dashboard/${user?.role === 'super_admin' ? 'super-admin' : user?.role === 'admin' ? 'admin' : 'employee'}`} 
                  className="flex items-center space-x-3">
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
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${isActivePath(item.href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link
                href="/attendance"
                className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ml-2"
              >
                <span className="mr-2">🖥️</span>
                Punch Station
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-white text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs opacity-80">
                <span className="mr-1">{user?.role === 'super_admin' ? '👑' : user?.role === 'admin' ? '👤' : '👨‍💼'}</span>
                {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Employee'}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <span className="mr-2">🚪</span>
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-3">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${isActivePath(item.href)
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }
                `}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link
                href="/attendance"
                className="bg-white/10 text-white px-3 py-2 rounded-lg text-sm font-medium"
              >
                🖥️ Punch
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;