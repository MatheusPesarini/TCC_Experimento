import { Request, Response, NextFunction } from 'express';
import produtoService from '../services/produto.service.js';
import { CreateProdutoDTO, UpdateProdutoDTO } from '../types/produto.types.js';
import { isValidId } from '../utils/validators.js';
import { BadRequestError } from '../types/errors.types.js';

class ProdutoController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateProdutoDTO = req.body;
      const produto = produtoService.create(data);
      res.status(201).json(produto);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoria, ativo } = req.query;

      const filters: { categoria?: string; ativo?: string } = {};

      if (categoria && typeof categoria === 'string') {
        filters.categoria = categoria;
      }

      if (ativo && typeof ativo === 'string') {
        filters.ativo = ativo;
      }

      const produtos = produtoService.findAll(filters);
      res.status(200).json(produtos);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        throw new BadRequestError('ID inválido');
      }

      const produto = produtoService.findById(parseInt(id, 10));
      res.status(200).json(produto);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        throw new BadRequestError('ID inválido');
      }

      const data: UpdateProdutoDTO = req.body;
      const produto = produtoService.update(parseInt(id, 10), data);
      res.status(200).json(produto);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        throw new BadRequestError('ID inválido');
      }

      produtoService.delete(parseInt(id, 10));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ProdutoController();
