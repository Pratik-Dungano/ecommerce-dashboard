import { Router } from 'express';
import {
  getRevenueTrends,
  getSalaryDistribution,
  getTaskAnalytics,
  getEmployeePerformance,
  getDashboardAnalytics
} from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdminOrSuperAdmin, requireSuperAdmin } from '../middleware/roleCheck';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Routes accessible by both admin and super_admin
router.get('/revenue-trends', requireAdminOrSuperAdmin, getRevenueTrends);
router.get('/task-analytics', requireAdminOrSuperAdmin, getTaskAnalytics);
router.get('/employee-performance', requireAdminOrSuperAdmin, getEmployeePerformance);

// Routes accessible only by super_admin
router.get('/salary-distribution', requireSuperAdmin, getSalaryDistribution);
router.get('/dashboard', requireSuperAdmin, getDashboardAnalytics);

export default router; 