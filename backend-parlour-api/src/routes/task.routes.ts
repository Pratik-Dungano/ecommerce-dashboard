import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByEmployee,
  getMyTasks,
  getTaskStats,
  getRevenue,
} from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth';
import { requireSuperAdmin, requireAdminOrSuperAdmin } from '../middleware/roleCheck';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Routes accessible by both admin and super_admin
router.get('/', requireAdminOrSuperAdmin, getAllTasks);
router.get('/stats', requireAdminOrSuperAdmin, getTaskStats);
router.get('/revenue', requireAdminOrSuperAdmin, getRevenue);
router.get('/employee/:employeeId', requireAdminOrSuperAdmin, getTasksByEmployee);

// Route for employees to get their own tasks (must be before /:id route)
router.get('/my-tasks', authenticateToken, getMyTasks);

// Route for getting task by ID (must be after specific routes)
router.get('/:id', requireAdminOrSuperAdmin, getTaskById);

// Routes accessible only by super_admin
router.post('/', requireSuperAdmin, createTask);
router.put('/:id', requireSuperAdmin, updateTask);
router.delete('/:id', requireSuperAdmin, deleteTask);

export default router; 