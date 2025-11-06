// filepath: c:\Users\mathe\Desktop\TCC_Experimento\GPT-5\task3\src\services\productService.ts
import { Produto, ProdutoCreateInput, ProdutoUpdateInput } from '../types/index.js';
import { productsRepository } from '../repositories/productsRepository.js';
import { hasAtMostTwoDecimals, isNonNegativeInteger } from '../utils/money.js';
import { isNonEmptyString } from '../utils/validation.js';
import { ordersRepository } from '../repositories/ordersRepository.js';

export class ProductService {
  create(input: any): { ok: true; value: Produto } | { ok: false; code: number; message: string } {
    // validações
    if (!isNonEmptyString(input?.nome) || !isNonEmptyString(input?.descricao) || !isNonEmptyString(input?.categoria)) {
      return { ok: false, code: 400, message: 'Campos obrigatórios inválidos' };
    }
    if (typeof input?.preco !== 'number' || input.preco <= 0 || !hasAtMostTwoDecimals(input.preco)) {
      return { ok: false, code: 400, message: 'Preço inválido' };
    }
    if (!isNonNegativeInteger(input?.quantidadeEstoque) || !isNonNegativeInteger(input?.estoqueMinimo)) {
      return { ok: false, code: 400, message: 'Quantidades inválidas' };
    }

    const produto = productsRepository.create({
      nome: input.nome,
      descricao: input.descricao,
      preco: input.preco,
      categoria: input.categoria,
      quantidadeEstoque: input.quantidadeEstoque,
      estoqueMinimo: input.estoqueMinimo,
      ativo: input.ativo ?? true,
    });
    return { ok: true, value: produto };
  }

  list(filters: { categoria?: string; ativo?: string | boolean }): Produto[] {
    let ativoBool: boolean | undefined = undefined;
    if (typeof filters.ativo === 'string') {
      if (filters.ativo.toLowerCase() === 'true') ativoBool = true;
      else if (filters.ativo.toLowerCase() === 'false') ativoBool = false;
    } else if (typeof filters.ativo === 'boolean') {
      ativoBool = filters.ativo;
    }
    return productsRepository.list({ categoria: filters.categoria, ativo: ativoBool });
  }

  getById(id: number): Produto | undefined {
    return productsRepository.getById(id);
  }

  update(id: number, patch: any): { ok: true; value: Produto } | { ok: false; code: number; message: string } {
    if (!patch || Object.keys(patch).length === 0) {
      return { ok: false, code: 400, message: 'Body vazio' };
    }
    const existing = productsRepository.getById(id);
    if (!existing) return { ok: false, code: 404, message: 'Produto não encontrado' };

    const updateData: ProdutoUpdateInput = {};
    if (patch.nome !== undefined) {
      if (!isNonEmptyString(patch.nome)) return { ok: false, code: 400, message: 'Nome inválido' };
      updateData.nome = patch.nome;
    }
    if (patch.descricao !== undefined) {
      if (!isNonEmptyString(patch.descricao)) return { ok: false, code: 400, message: 'Descrição inválida' };
      updateData.descricao = patch.descricao;
    }
    if (patch.categoria !== undefined) {
      if (!isNonEmptyString(patch.categoria)) return { ok: false, code: 400, message: 'Categoria inválida' };
      updateData.categoria = patch.categoria;
    }
    if (patch.preco !== undefined) {
      if (typeof patch.preco !== 'number' || patch.preco <= 0 || !hasAtMostTwoDecimals(patch.preco)) {
        return { ok: false, code: 400, message: 'Preço inválido' };
      }
      updateData.preco = patch.preco;
    }
    if (patch.quantidadeEstoque !== undefined) {
      if (!isNonNegativeInteger(patch.quantidadeEstoque)) return { ok: false, code: 400, message: 'Quantidade inválida' };
      updateData.quantidadeEstoque = patch.quantidadeEstoque;
    }
    if (patch.estoqueMinimo !== undefined) {
      if (!isNonNegativeInteger(patch.estoqueMinimo)) return { ok: false, code: 400, message: 'Estoque mínimo inválido' };
      updateData.estoqueMinimo = patch.estoqueMinimo;
    }
    if (patch.ativo !== undefined) {
      if (typeof patch.ativo !== 'boolean') return { ok: false, code: 400, message: 'Ativo inválido' };
      updateData.ativo = patch.ativo;
    }

    const updated = productsRepository.update(id, updateData)!;
    return { ok: true, value: updated };
  }

  delete(id: number): { ok: true } | { ok: false; code: number; message: string } {
    const existing = productsRepository.getById(id);
    if (!existing) return { ok: false, code: 404, message: 'Produto não encontrado' };

    // Regra: não pode deletar se houver pedidos não cancelados
    if (ordersRepository.hasActiveOrdersForProduct(id)) {
      return { ok: false, code: 409, message: 'Produto em pedidos ativos' };
    }

    productsRepository.delete(id);
    return { ok: true };
  }
}

export const productService = new ProductService();
