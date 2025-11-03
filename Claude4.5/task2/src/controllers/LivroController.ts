
import { Request, Response, NextFunction } from 'express';
import { LivroService } from '../services/LivroService';
import { CreateLivroDTO, UpdateLivroDTO } from '../types';

export class LivroController {
  constructor(private livroService: LivroService) { }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateLivroDTO = req.body;
      const livro = this.livroService.create(data);
      res.status(201).json(livro);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const livros = this.livroService.findAll();
      res.status(200).json(livros);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const livro = this.livroService.findById(id);
      res.status(200).json(livro);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const data: UpdateLivroDTO = req.body;
      const livro = this.livroService.update(id, data);
      res.status(200).json(livro);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      this.livroService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
