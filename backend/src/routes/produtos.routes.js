import { Router } from 'express';
import { listarProdutos, criarProduto, atualizarProduto, removerProduto } from '../controllers/produtoController.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', asyncHandler(listarProdutos));
router.post('/', asyncHandler(criarProduto));
router.put('/:id', asyncHandler(atualizarProduto));
router.delete('/:id', asyncHandler(removerProduto));

export default router;
