import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateJWT, getMe);

export default router;

