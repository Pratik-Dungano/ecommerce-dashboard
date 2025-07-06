import { Router } from 'express';
import { getSalaryHistory, paySalary, getSalaryStats } from '../controllers/salary.controller';
import { authenticateToken } from '../middleware/auth';
import checkRole from '../middleware/roleCheck';

const router = Router();

// Protected routes - require authentication
router.use(authenticateToken);

// Get salary statistics - admin and super admin only
router.get('/stats', checkRole(['admin', 'super_admin']), getSalaryStats);

// Get salary history for an employee
router.get('/:employeeId', getSalaryHistory);

// Pay salary - super admin only
router.post('/:employeeId/pay', checkRole(['super_admin']), paySalary);

export default router; 