import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(authMiddleware);
router.get('/', asyncHandler(getDashboard));
export default router;
