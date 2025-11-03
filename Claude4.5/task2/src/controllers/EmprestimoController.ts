
import { Request, Response, NextFunction } from 'express';
import { EmprestimoService } from '../services/EmprestimoService';
import { CreateEmprestimoDTO } from '../types';

export class EmprestimoController {
  constructor(private emprestimoService: EmprestimoService) { }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateEmprestimoDTO = req.body;
      const emprestimo = this.emprestimoService.create(data);
      res.status(201).json(emprestimo);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const emprestimos = this.emprestimoService.findAll();
      res.status(200).json(emprestimos);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const emprestimo = this.emprestimoService.findById(id);
      res.status(200).json(emprestimo);
    } catch (error) {
      next(error);
    }
  };

  devolver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const emprestimo = this.emprestimoService.devolver(id);
      res.status(200).json(emprestimo);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      this.emprestimoService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
