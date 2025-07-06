import { User } from '../types';

// JWT token management
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('parlour_token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('parlour_token', token);
  // Set token cookie for middleware
  document.cookie = `parlour_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('parlour_token');
  localStorage.removeItem('parlour_user');
  // Remove cookies
  document.cookie = 'parlour_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  document.cookie = 'parlour_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
};

// User management
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('parlour_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  const userStr = JSON.stringify(user);
  localStorage.setItem('parlour_user', userStr);
  // Set user data cookie for middleware
  document.cookie = `parlour_user=${encodeURIComponent(userStr)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
};

export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('parlour_user');
  // Remove user cookie
  document.cookie = 'parlour_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
};

// JWT decoding (basic)
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
};

// Check user role
export const hasRole = (requiredRoles: string[]): boolean => {
  const user = getUser();
  if (!user) return false;
  return requiredRoles.includes(user.role);
};

export const isSuperAdmin = (): boolean => {
  return hasRole(['super_admin']);
};

export const isAdmin = (): boolean => {
  return hasRole(['admin', 'super_admin']);
};

// Logout function
export const logout = (): void => {
  removeToken();
  removeUser();
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Auto logout when token expires
export const checkTokenAndLogout = (): void => {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    logout();
  }
};