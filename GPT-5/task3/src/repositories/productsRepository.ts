// filepath: c:\Users\mathe\Desktop\TCC_Experimento\GPT-5\task3\src\repositories\productsRepository.ts
import { Produto, ProdutoCreateInput, ProdutoUpdateInput } from '../types/index.js';

export class ProductsRepository {
  private products: Produto[] = [];
  private nextId = 1;

  create(input: ProdutoCreateInput): Produto {
    const now = new Date().toISOString();
    const produto: Produto = {
      id: this.nextId++,
      nome: input.nome,
      descricao: input.descricao,
      preco: input.preco,
      categoria: input.categoria,
      quantidadeEstoque: input.quantidadeEstoque,
      estoqueMinimo: input.estoqueMinimo,
      ativo: input.ativo ?? true,
      dataDeCadastro: now,
    };
    this.products.push(produto);
    return produto;
  }

  list(filters?: { categoria?: string; ativo?: boolean }): Produto[] {
    let arr = [...this.products];
    if (filters?.categoria) {
      arr = arr.filter(p => p.categoria === filters.categoria);
    }
    if (typeof filters?.ativo === 'boolean') {
      arr = arr.filter(p => p.ativo === filters.ativo);
    }
    return arr;
  }

  getById(id: number): Produto | undefined {
    return this.products.find(p => p.id === id);
  }

  update(id: number, patch: ProdutoUpdateInput): Produto | undefined {
    const p = this.getById(id);
    if (!p) return undefined;
    if (patch.nome !== undefined) p.nome = patch.nome;
    if (patch.descricao !== undefined) p.descricao = patch.descricao;
    if (patch.preco !== undefined) p.preco = patch.preco;
    if (patch.categoria !== undefined) p.categoria = patch.categoria;
    if (patch.quantidadeEstoque !== undefined) p.quantidadeEstoque = patch.quantidadeEstoque;
    if (patch.estoqueMinimo !== undefined) p.estoqueMinimo = patch.estoqueMinimo;
    if (patch.ativo !== undefined) p.ativo = patch.ativo;
    return p;
  }

  delete(id: number): boolean {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    return true;
  }
}

export const productsRepository = new ProductsRepository();
