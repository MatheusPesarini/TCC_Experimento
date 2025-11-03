/**
 * Controller de Usuários (manipulação de requisições HTTP)
 */

import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario.service.js';
import { isValidId } from '../utils/validators.js';

export class UsuarioController {
  constructor(private service: UsuarioService) { }

  /**
   * POST /usuarios - Criar novo usuário
   */
  criar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome, email, senha } = req.body;

      const resultado = this.service.criar({ nome, email, senha });

      if (!resultado.success) {
        res.status(resultado.status).json({ error: resultado.error });
        return;
      }

      res.status(201).json(resultado.data);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * GET /usuarios - Listar todos os usuários
   */
  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = this.service.listarTodos();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * GET /usuarios/:id - Buscar usuário por ID
   */
  buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Validar ID
      if (!isValidId(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const resultado = this.service.buscarPorId(Number(id));

      if (!resultado.success) {
        res.status(resultado.status).json({ error: resultado.error });
        return;
      }

      res.status(200).json(resultado.data);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * PATCH /usuarios/:id - Atualizar usuário parcialmente
   */
  atualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { nome, email, senha } = req.body;

      // Validar ID
      if (!isValidId(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const resultado = this.service.atualizar(Number(id), { nome, email, senha });

      if (!resultado.success) {
        res.status(resultado.status).json({ error: resultado.error });
        return;
      }

      res.status(200).json(resultado.data);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * DELETE /usuarios/:id - Remover usuário
   */
  deletar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Validar ID
      if (!isValidId(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const resultado = this.service.deletar(Number(id));

      if (!resultado.success) {
        res.status(resultado.status).json({ error: resultado.error });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}
