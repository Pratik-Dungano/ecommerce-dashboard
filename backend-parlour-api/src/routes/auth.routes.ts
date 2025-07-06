import { Router } from 'express';
import { login, register, getProfile, getAllUsers, updateUserRole, deleteUser, getUserStats } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import checkRole from '../middleware/roleCheck';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.get('/users', authenticateToken, checkRole(['super_admin']), getAllUsers);
router.get('/users/stats', authenticateToken, checkRole(['super_admin']), getUserStats);
router.patch('/users/:userId/role', authenticateToken, checkRole(['super_admin']), updateUserRole);
router.delete('/users/:userId', authenticateToken, checkRole(['super_admin']), deleteUser);

export default router; 