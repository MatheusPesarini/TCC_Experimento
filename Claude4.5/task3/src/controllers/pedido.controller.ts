import { Request, Response, NextFunction } from 'express';
import pedidoService from '../services/pedido.service';
import { CreatePedidoDTO, StatusPedido } from '../types/pedido.types';
import { isValidId } from '../utils/validators';
import { BadRequestError } from '../types/errors.types';

class PedidoController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreatePedidoDTO = req.body;
      const pedido = pedidoService.create(data);
      res.status(201).json(pedido);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, clienteEmail } = req.query;
      
      const filters: { status?: string; clienteEmail?: string } = {};
      
      if (status && typeof status === 'string') {
        filters.status = status;
      }
      
      if (clienteEmail && typeof clienteEmail === 'string') {
        filters.clienteEmail = clienteEmail;
      }

      const pedidos = pedidoService.findAll(filters);
      res.status(200).json(pedidos);
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

      const pedido = pedidoService.findById(parseInt(id, 10));
      res.status(200).json(pedido);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        throw new BadRequestError('ID inválido');
      }

      const { novoStatus } = req.body;

      if (!novoStatus) {
        throw new BadRequestError('Status é obrigatório');
      }

      const pedido = pedidoService.updateStatus(parseInt(id, 10), novoStatus as StatusPedido);
      res.status(200).json(pedido);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        throw new BadRequestError('ID inválido');
      }

      const pedido = pedidoService.cancel(parseInt(id, 10));
      res.status(200).json(pedido);
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

      pedidoService.delete(parseInt(id, 10));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new PedidoController();
