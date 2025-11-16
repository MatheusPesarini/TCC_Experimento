
import { Router } from 'express';
import { LivroController } from '../controllers/livro-controller.js';

export function criarLivroRoutes(livroController: LivroController): Router {
  const router = Router();

  router.post('/livros', livroController.criar);
  router.get('/livros', livroController.listarTodos);
  router.get('/livros/:id', livroController.buscarPorId);
  router.patch('/livros/:id', livroController.atualizar);
  router.delete('/livros/:id', livroController.deletar);

  return router;
}
