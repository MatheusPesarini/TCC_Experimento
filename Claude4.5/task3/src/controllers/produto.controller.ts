
import { Request, Response } from 'express';
import { ProdutoService } from '../services/produto.service.js';
import { validarId } from '../utils/validators.js';
import { FiltrosProduto } from '../types/produto.types.js';

export class ProdutoController {
  private produtoService: ProdutoService;

  constructor() {
    this.produtoService = new ProdutoService();
  }

  criar = async (req: Request, res: Response): Promise<void> => {
    try {
      const produto = this.produtoService.criar(req.body);
      res.status(201).json(produto);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  buscarTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const filtros: FiltrosProduto = {};

      if (req.query.categoria) {
        filtros.categoria = req.query.categoria as string;
      }

      if (req.query.ativo !== undefined) {
        filtros.ativo = req.query.ativo === 'true';
      }

      const produtos = this.produtoService.buscarTodos(filtros);
      res.status(200).json(produtos);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validarId(req.params.id);
      const produto = this.produtoService.buscarPorId(id);

      if (!produto) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(200).json(produto);
    } catch (error) {
      if (error instanceof Error && error.message === 'ID inválido') {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validarId(req.params.id);
      const produto = this.produtoService.atualizar(id, req.body);

      if (!produto) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(200).json(produto);
    } catch (error) {
      if (error instanceof Error && error.message === 'ID inválido') {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  deletar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validarId(req.params.id);
      const resultado = this.produtoService.deletar(id);

      if (!resultado.sucesso) {
        if (resultado.erro === 'not_found') {
          res.status(404).json({ error: 'Produto não encontrado' });
          return;
        }
        if (resultado.erro === 'conflict') {
          res.status(409).json({ error: 'Produto está em pedidos não cancelados' });
          return;
        }
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'ID inválido') {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}
