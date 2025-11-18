
import { Request, Response, NextFunction } from 'express';
import {
  ValidationError,
  validarEmail,
  validarInteiro,
  validarStringNaoVazia
} from '../utils/validators.js';
import { CriarPedidoDTO, StatusPedido, AtualizarStatusDTO } from '../types/pedido.types.js';

const STATUSES_VALIDOS: StatusPedido[] = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];

export function validarCriarPedido(req: Request, res: Response, next: NextFunction): void {
  try {
    const dto: CriarPedidoDTO = req.body;

    if (!validarStringNaoVazia(dto.clienteNome)) {
      throw new ValidationError('Nome do cliente é obrigatório e não pode ser vazio');
    }

    if (!validarStringNaoVazia(dto.clienteEmail) || !validarEmail(dto.clienteEmail)) {
      throw new ValidationError('Email do cliente é obrigatório e deve ser válido');
    }

    if (!validarStringNaoVazia(dto.clienteEndereco)) {
      throw new ValidationError('Endereço do cliente é obrigatório e não pode ser vazio');
    }

    if (!Array.isArray(dto.itens) || dto.itens.length === 0) {
      throw new ValidationError('Itens é obrigatório e deve conter pelo menos um item');
    }

    for (const item of dto.itens) {
      if (typeof item.produtoId !== 'number' || !validarInteiro(item.produtoId) || item.produtoId <= 0) {
        throw new ValidationError('Produto ID deve ser um número inteiro positivo');
      }

      if (typeof item.quantidade !== 'number' || !validarInteiro(item.quantidade) || item.quantidade <= 0) {
        throw new ValidationError('Quantidade deve ser um número inteiro positivo');
      }
    }

    if (dto.desconto !== undefined && (typeof dto.desconto !== 'number' || dto.desconto < 0)) {
      throw new ValidationError('Desconto deve ser um número não negativo');
    }

    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: 'Dados inválidos' });
  }
}

export function validarAtualizarStatus(req: Request, res: Response, next: NextFunction): void {
  try {
    const dto: AtualizarStatusDTO = req.body;

    if (!dto.novoStatus) {
      throw new ValidationError('Novo status é obrigatório');
    }

    if (!STATUSES_VALIDOS.includes(dto.novoStatus)) {
      throw new ValidationError('Status inválido');
    }

    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: 'Dados inválidos' });
  }
}
