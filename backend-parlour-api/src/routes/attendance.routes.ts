import { Router } from 'express';
import {
  getAllAttendance,
  punchInOut,
  getEmployeeAttendance,
  getTodaysAttendance,
  getAttendanceStats,
  getMyAttendance,
} from '../controllers/attendance.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdminOrSuperAdmin } from '../middleware/roleCheck';

const router = Router();

// Public route for punch in/out (no authentication required)
router.post('/punch', punchInOut);

// Protected routes (require authentication and admin role)
router.get('/', authenticateToken, requireAdminOrSuperAdmin, getAllAttendance);
router.get('/stats', authenticateToken, requireAdminOrSuperAdmin, getAttendanceStats);
router.get('/today', authenticateToken, requireAdminOrSuperAdmin, getTodaysAttendance);
router.get('/employee/:employeeId', authenticateToken, requireAdminOrSuperAdmin, getEmployeeAttendance);

// Route for employees to get their own attendance
router.get('/my-attendance', authenticateToken, getMyAttendance);

export default router;