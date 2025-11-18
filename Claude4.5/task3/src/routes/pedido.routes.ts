
import { Router } from 'express';
import { PedidoController } from '../controllers/pedido.controller.js';
import { validarCriarPedido, validarAtualizarStatus } from '../validators/pedido.validator.js';

const router = Router();
const controller = new PedidoController();

router.post('/', validarCriarPedido, controller.criar);
router.get('/', controller.buscarTodos);
router.get('/:id', controller.buscarPorId);
router.patch('/:id/status', validarAtualizarStatus, controller.atualizarStatus);
router.patch('/:id/cancelar', controller.cancelar);
router.delete('/:id', controller.deletar);

export default router;
