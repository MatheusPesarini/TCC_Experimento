import { Produto } from '../types/produto.types';

class ProdutoRepository {
  private produtos: Produto[] = [];
  private nextId: number = 1;

  create(produto: Omit<Produto, 'id'>): Produto {
    const novoProduto: Produto = {
      ...produto,
      id: this.nextId++
    };
    this.produtos.push(novoProduto);
    return novoProduto;
  }

  findAll(filters?: { categoria?: string; ativo?: boolean }): Produto[] {
    let result = this.produtos;

    if (filters?.categoria) {
      result = result.filter(p => p.categoria === filters.categoria);
    }

    if (filters?.ativo !== undefined) {
      result = result.filter(p => p.ativo === filters.ativo);
    }

    return result;
  }

  findById(id: number): Produto | undefined {
    return this.produtos.find(p => p.id === id);
  }

  update(id: number, updates: Partial<Produto>): Produto | undefined {
    const index = this.produtos.findIndex(p => p.id === id);
    
    if (index === -1) {
      return undefined;
    }

    this.produtos[index] = {
      ...this.produtos[index],
      ...updates
    };

    return this.produtos[index];
  }

  delete(id: number): boolean {
    const index = this.produtos.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false;
    }

    this.produtos.splice(index, 1);
    return true;
  }

  decrementarEstoque(id: number, quantidade: number): boolean {
    const produto = this.findById(id);
    
    if (!produto) {
      return false;
    }

    if (produto.quantidadeEstoque < quantidade) {
      return false;
    }

    produto.quantidadeEstoque -= quantidade;
    return true;
  }

  incrementarEstoque(id: number, quantidade: number): boolean {
    const produto = this.findById(id);
    
    if (!produto) {
      return false;
    }

    produto.quantidadeEstoque += quantidade;
    return true;
  }
}

export default new ProdutoRepository();
