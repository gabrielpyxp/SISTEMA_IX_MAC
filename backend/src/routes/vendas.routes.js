import { Router } from 'express';
import { listarVendas, criarVenda, atualizarStatusVenda, excluirVenda, exportarVendasExcel, listarDevedoresAgrupados, atualizarCompradorVenda, marcarTodasComoPagas } from '../controllers/vendaController.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', asyncHandler(listarVendas));
router.post('/', asyncHandler(criarVenda));
router.put('/:id/status', asyncHandler(atualizarStatusVenda));
router.put('/:id/comprador', asyncHandler(atualizarCompradorVenda));
router.delete('/:id', asyncHandler(excluirVenda));
router.get('/export/excel', asyncHandler(exportarVendasExcel));
router.get('/devedores', asyncHandler(listarDevedoresAgrupados));
router.post('/devedores/marcar-pagas', asyncHandler(marcarTodasComoPagas));

export default router;
