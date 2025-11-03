
import { Router } from 'express';
import { EmprestimoController } from '../controllers/EmprestimoController';
import { validateNumericId } from '../middlewares/validators';

export const createEmprestimoRoutes = (emprestimoController: EmprestimoController): Router => {
  const router = Router();

  router.post('/', emprestimoController.create);
  router.get('/', emprestimoController.findAll);
  router.get('/:id', validateNumericId, emprestimoController.findById);
  router.patch('/:id/devolver', validateNumericId, emprestimoController.devolver);
  router.delete('/:id', validateNumericId, emprestimoController.delete);

  return router;
};
