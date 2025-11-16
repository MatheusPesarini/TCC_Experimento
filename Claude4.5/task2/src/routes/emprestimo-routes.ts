
import { Router } from 'express';
import { EmprestimoController } from '../controllers/emprestimo-controller.js';

export function criarEmprestimoRoutes(emprestimoController: EmprestimoController): Router {
  const router = Router();

  router.post('/emprestimos', emprestimoController.criar);
  router.get('/emprestimos', emprestimoController.listarTodos);
  router.get('/emprestimos/:id', emprestimoController.buscarPorId);
  router.patch('/emprestimos/:id/devolver', emprestimoController.devolver);
  router.delete('/emprestimos/:id', emprestimoController.deletar);

  return router;
}
