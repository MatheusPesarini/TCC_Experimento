/**
 * Rotas de Usuários
 */

import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller.js';

export function criarRotasUsuario(controller: UsuarioController): Router {
  const router = Router();

  router.post('/usuarios', controller.criar);
  router.get('/usuarios', controller.listar);
  router.get('/usuarios/:id', controller.buscarPorId);
  router.patch('/usuarios/:id', controller.atualizar);
  router.delete('/usuarios/:id', controller.deletar);

  return router;
}
