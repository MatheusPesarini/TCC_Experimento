
import { Router } from 'express';
import { LivroController } from '../controllers/LivroController';
import { validateNumericId, validateRequestBody } from '../middlewares/validators';

export const createLivroRoutes = (livroController: LivroController): Router => {
  const router = Router();

  router.post('/', livroController.create);
  router.get('/', livroController.findAll);
  router.get('/:id', validateNumericId, livroController.findById);
  router.patch('/:id', validateNumericId, validateRequestBody, livroController.update);
  router.delete('/:id', validateNumericId, livroController.delete);

  return router;
};
