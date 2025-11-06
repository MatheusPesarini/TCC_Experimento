import { Router } from 'express';
import produtoController from '../controllers/produto.controller';

const router = Router();

router.post('/', produtoController.create.bind(produtoController));
router.get('/', produtoController.findAll.bind(produtoController));
router.get('/:id', produtoController.findById.bind(produtoController));
router.patch('/:id', produtoController.update.bind(produtoController));
router.delete('/:id', produtoController.delete.bind(produtoController));

export default router;
