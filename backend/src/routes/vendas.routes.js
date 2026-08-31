import { Router } from 'express';
import { listarVendas, criarVenda, atualizarStatusVenda } from '../controllers/vendaController.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', asyncHandler(listarVendas));
router.post('/', asyncHandler(criarVenda));
router.put('/:id/status', asyncHandler(atualizarStatusVenda));

export default router;
