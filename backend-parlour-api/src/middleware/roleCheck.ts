import { Request, Response, NextFunction } from 'express';

type UserRole = 'employee' | 'admin' | 'super_admin';

const checkRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Legacy exports for backward compatibility
export const requireSuperAdmin = checkRole(['super_admin']);
export const requireAdminOrSuperAdmin = checkRole(['admin', 'super_admin']);
export const requireEmployee = checkRole(['employee']);

export default checkRole; 