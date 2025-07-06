import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeSalary,
  moveEmployeeToPreviousStaff,
  manualCleanupLeftEmployees,
  markEmployeeAsLeaving,
} from '../controllers/employee.controller';
import { authenticateToken } from '../middleware/auth';
import checkRole from '../middleware/roleCheck';

const router = Router();

// Protected routes - require authentication
router.use(authenticateToken);

// Get all employees
router.get('/', getAllEmployees);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Create new employee - admin only
router.post('/', checkRole(['admin', 'super_admin']), createEmployee);

// Update employee - admin only
router.put('/:id', checkRole(['admin', 'super_admin']), updateEmployee);

// Delete employee - admin only
router.delete('/:id', checkRole(['admin', 'super_admin']), deleteEmployee);

// Mark employee as leaving - admin only
router.patch('/:id/mark-leaving', checkRole(['admin', 'super_admin']), markEmployeeAsLeaving);

// Move employee to previous staff and delete from both models - super_admin only
router.post('/:id/move-to-previous-staff', checkRole(['super_admin']), moveEmployeeToPreviousStaff);

// Manual cleanup of left employees - super_admin only
router.post('/cleanup-left-employees', checkRole(['super_admin']), manualCleanupLeftEmployees);

// Update employee salary - admin only
router.patch('/:id/salary', checkRole(['admin', 'super_admin']), updateEmployeeSalary);

export default router; 