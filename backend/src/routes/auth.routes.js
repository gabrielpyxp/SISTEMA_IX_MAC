import { Router } from 'express';
import { login, register, me } from '../controllers/authController.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.get('/me', authMiddleware, asyncHandler(me));
export default router;
