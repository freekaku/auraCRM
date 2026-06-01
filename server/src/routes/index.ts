import { Router } from 'express';
import authRoutes from './auth';
import leadRoutes from './leads';

const router = Router();

// Mount modules
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);

export default router;

