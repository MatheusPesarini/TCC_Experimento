
import { ProdutoModel } from '../models/produto.model.js';
import { Produto, FiltrosProduto } from '../types/produto.types.js';

export class ProdutoRepository {
  buscarPorId(id: number): Produto | undefined {
    return ProdutoModel.buscarPorId(id);
  }

  buscarTodos(filtros?: FiltrosProduto): Produto[] {
    let produtos = ProdutoModel.buscarTodos();

    if (filtros?.categoria) {
      produtos = produtos.filter(p => p.categoria === filtros.categoria);
    }

    if (filtros?.ativo !== undefined) {
      produtos = produtos.filter(p => p.ativo === filtros.ativo);
    }

    return produtos;
  }

  criar(produto: Omit<Produto, 'id' | 'ativo' | 'dataDeCadastro'>): Produto {
    return ProdutoModel.criar(produto);
  }

  atualizar(id: number, updates: Partial<Produto>): Produto | undefined {
    return ProdutoModel.atualizar(id, updates);
  }

  deletar(id: number): boolean {
    return ProdutoModel.deletar(id);
  }

  decrementarEstoque(id: number, quantidade: number): boolean {
    const produto = this.buscarPorId(id);
    if (!produto) return false;

    const novoEstoque = produto.quantidadeEstoque - quantidade;
    if (novoEstoque < 0) return false;

    ProdutoModel.atualizar(id, { quantidadeEstoque: novoEstoque });
    return true;
  }

  incrementarEstoque(id: number, quantidade: number): boolean {
    const produto = this.buscarPorId(id);
    if (!produto) return false;

    const novoEstoque = produto.quantidadeEstoque + quantidade;
    ProdutoModel.atualizar(id, { quantidadeEstoque: novoEstoque });
    return true;
  }
}
