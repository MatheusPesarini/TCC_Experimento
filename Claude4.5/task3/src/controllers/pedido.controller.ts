
import { Request, Response } from 'express';
import { PedidoService } from '../services/pedido.service.js';
import { validarId } from '../utils/validators.js';
import { FiltrosPedido, StatusPedido } from '../types/pedido.types.js';

export class PedidoController {
  private pedidoService: PedidoService;

  constructor() {
    this.pedidoService = new PedidoService();
  }

  criar = async (req: Request, res: Response): Promise<void> => {
    try {
      const resultado = this.pedidoService.criar(req.body);

      if (!resultado.sucesso) {
        if (resultado.erro === 'not_found') {
          res.status(404).json({ error: resultado.detalhes || 'Produto não encontrado' });
          return;
        }
        if (resultado.erro === 'conflict') {
          res.status(409).json({ error: resultado.detalhes || 'Conflito' });
          return;
        }
        if (resultado.erro === 'bad_request') {
          res.status(400).json({ error: resultado.detalhes || 'Dados inválidos' });
          return;
        }
      }

      res.status(201).json(resultado.pedido);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  buscarTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const filtros: FiltrosPedido = {};

      if (req.query.status) {
        filtros.status = req.query.status as StatusPedido;
      }

      if (req.query.clienteEmail) {
        filtros.clienteEmail = req.query.clienteEmail as string;
      }

      const pedidos = this.pedidoService.buscarTodos(filtros);
      res.status(200).json(pedidos);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validarId(req.params.id);
      const pedido = this.pedidoService.buscarPorId(id);

      if (!pedido) {
        res.status(404).json({ error: 'Pedido não encontrado' });
        return;
      }

      res.status(200).json(pedido);
    } catch (error) {
      if (error instanceof Error && error.message === 'ID inválido') {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  atualizarStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validarId(req.params.id);
      const { novoStatus } = req.body;

      const resultado = this.pedidoService.atualizarStatus(id, novoStatus);

      if (!resultado.sucesso) {
        if (resultado.erro === 'not_found') {
          res.status(404).json({ error: 'Pedido não encontrado' });
          return;
        }
        if (resultado.erro === 'conflict') {
          res.status(409).json({ error: resultado.detalhes || 'Conflito' });
          return;
        }
        if (resultado.erro === 'bad_request') {
          res.status(400).json({ error: resultado.detalhes || 'Transição inválida' });
          return;
        }
      }

      res.status(200).json(resultado.pedido);
    } catch (error) {
      if (error instanceof Error && error.message === 'ID inválido') {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  cancelar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validarId(req.params.id);
      const resultado = this.pedidoService.cancelar(id);

      if (!resultado.sucesso) {
        if (resultado.erro === 'not_found') {
          res.status(404).json({ error: 'Pedido não encontrado' });
          return;
        }
        if (resultado.erro === 'conflict') {
          res.status(409).json({ error: resultado.detalhes || 'Conflito' });
          return;
        }
      }

      res.status(200).json(resultado.pedido);
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
      const resultado = this.pedidoService.deletar(id);

      if (!resultado.sucesso) {
        if (resultado.erro === 'not_found') {
          res.status(404).json({ error: 'Pedido não encontrado' });
          return;
        }
        if (resultado.erro === 'conflict') {
          res.status(409).json({ error: resultado.detalhes || 'Conflito' });
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
