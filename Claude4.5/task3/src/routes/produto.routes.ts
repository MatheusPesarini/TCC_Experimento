
import { Router } from 'express';
import { ProdutoController } from '../controllers/produto.controller.js';
import { validarCriarProduto, validarAtualizarProduto } from '../validators/produto.validator.js';

const router = Router();
const controller = new ProdutoController();

router.post('/', validarCriarProduto, controller.criar);
router.get('/', controller.buscarTodos);
router.get('/:id', controller.buscarPorId);
router.patch('/:id', validarAtualizarProduto, controller.atualizar);
router.delete('/:id', controller.deletar);

export default router;
