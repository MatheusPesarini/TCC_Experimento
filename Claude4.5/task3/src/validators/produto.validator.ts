
import { Request, Response, NextFunction } from 'express';
import {
  ValidationError,
  validarPreco,
  validarInteiro,
  validarPositivo,
  validarStringNaoVazia
} from '../utils/validators.js';
import { CriarProdutoDTO, AtualizarProdutoDTO } from '../types/produto.types.js';

export function validarCriarProduto(req: Request, res: Response, next: NextFunction): void {
  try {
    const dto: CriarProdutoDTO = req.body;

    if (!validarStringNaoVazia(dto.nome)) {
      throw new ValidationError('Nome é obrigatório e não pode ser vazio');
    }

    if (!validarStringNaoVazia(dto.descricao)) {
      throw new ValidationError('Descrição é obrigatória e não pode ser vazia');
    }

    if (!validarStringNaoVazia(dto.categoria)) {
      throw new ValidationError('Categoria é obrigatória e não pode ser vazia');
    }

    if (typeof dto.preco !== 'number' || !validarPreco(dto.preco)) {
      throw new ValidationError('Preço deve ser maior que zero e ter no máximo 2 casas decimais');
    }

    if (typeof dto.quantidadeEstoque !== 'number' || !validarInteiro(dto.quantidadeEstoque) || !validarPositivo(dto.quantidadeEstoque)) {
      throw new ValidationError('Quantidade em estoque deve ser um número inteiro não negativo');
    }

    if (typeof dto.estoqueMinimo !== 'number' || !validarInteiro(dto.estoqueMinimo) || !validarPositivo(dto.estoqueMinimo)) {
      throw new ValidationError('Estoque mínimo deve ser um número inteiro não negativo');
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

export function validarAtualizarProduto(req: Request, res: Response, next: NextFunction): void {
  try {
    const dto: AtualizarProdutoDTO = req.body;

    // Body não pode estar vazio
    if (Object.keys(dto).length === 0) {
      throw new ValidationError('Nenhum campo fornecido para atualização');
    }

    if (dto.nome !== undefined && !validarStringNaoVazia(dto.nome)) {
      throw new ValidationError('Nome não pode ser vazio');
    }

    if (dto.descricao !== undefined && !validarStringNaoVazia(dto.descricao)) {
      throw new ValidationError('Descrição não pode ser vazia');
    }

    if (dto.categoria !== undefined && !validarStringNaoVazia(dto.categoria)) {
      throw new ValidationError('Categoria não pode ser vazia');
    }

    if (dto.preco !== undefined && (typeof dto.preco !== 'number' || !validarPreco(dto.preco))) {
      throw new ValidationError('Preço deve ser maior que zero e ter no máximo 2 casas decimais');
    }

    if (dto.quantidadeEstoque !== undefined && (typeof dto.quantidadeEstoque !== 'number' || !validarInteiro(dto.quantidadeEstoque) || !validarPositivo(dto.quantidadeEstoque))) {
      throw new ValidationError('Quantidade em estoque deve ser um número inteiro não negativo');
    }

    if (dto.estoqueMinimo !== undefined && (typeof dto.estoqueMinimo !== 'number' || !validarInteiro(dto.estoqueMinimo) || !validarPositivo(dto.estoqueMinimo))) {
      throw new ValidationError('Estoque mínimo deve ser um número inteiro não negativo');
    }

    if (dto.ativo !== undefined && typeof dto.ativo !== 'boolean') {
      throw new ValidationError('Ativo deve ser um valor booleano');
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
