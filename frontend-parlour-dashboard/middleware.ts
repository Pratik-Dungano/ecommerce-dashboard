import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('parlour_token')?.value;
  const path = request.nextUrl.pathname;

  // If no token and trying to access protected routes, redirect to login
  if (!token && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token and trying to access login, redirect to appropriate dashboard
  if (token && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Get user data from localStorage through cookie
  const userData = request.cookies.get('parlour_user')?.value;
  let userRole = 'employee'; // default role
  
  if (userData) {
    try {
      const user = JSON.parse(decodeURIComponent(userData));
      userRole = user.role;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  // Role-based routing protection
  if (path.startsWith('/dashboard')) {
    if (path.startsWith('/dashboard/super-admin') && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (path.startsWith('/dashboard/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (path.startsWith('/dashboard/employee') && userRole !== 'employee') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect root dashboard to appropriate role-based dashboard
    if (path === '/dashboard') {
      if (userRole === 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard/super-admin', request.url));
      }
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
      if (userRole === 'employee') {
        return NextResponse.redirect(new URL('/dashboard/employee', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login'
  ]
}; 