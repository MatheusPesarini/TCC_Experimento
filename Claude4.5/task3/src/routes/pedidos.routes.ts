import { Router } from 'express';
import pedidoController from '../controllers/pedido.controller';

const router = Router();

router.post('/', pedidoController.create.bind(pedidoController));
router.get('/', pedidoController.findAll.bind(pedidoController));
router.get('/:id', pedidoController.findById.bind(pedidoController));
router.patch('/:id/status', pedidoController.updateStatus.bind(pedidoController));
router.patch('/:id/cancelar', pedidoController.cancel.bind(pedidoController));
router.delete('/:id', pedidoController.delete.bind(pedidoController));

export default router;
