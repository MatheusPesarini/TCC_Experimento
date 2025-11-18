
import { Produto, CriarProdutoDTO } from '../types/produto.types.js';

export class ProdutoModel {
  private static contadorId = 1;
  private static produtos: Produto[] = [];

  static criar(dto: CriarProdutoDTO): Produto {
    const produto: Produto = {
      id: this.contadorId++,
      nome: dto.nome,
      descricao: dto.descricao,
      preco: dto.preco,
      categoria: dto.categoria,
      quantidadeEstoque: dto.quantidadeEstoque,
      estoqueMinimo: dto.estoqueMinimo,
      ativo: true,
      dataDeCadastro: new Date().toISOString()
    };

    this.produtos.push(produto);
    return produto;
  }

  static buscarPorId(id: number): Produto | undefined {
    return this.produtos.find(p => p.id === id);
  }

  static buscarTodos(): Produto[] {
    return [...this.produtos];
  }

  static atualizar(id: number, updates: Partial<Produto>): Produto | undefined {
    const index = this.produtos.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.produtos[index] = { ...this.produtos[index], ...updates };
    return this.produtos[index];
  }

  static deletar(id: number): boolean {
    const index = this.produtos.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.produtos.splice(index, 1);
    return true;
  }

  static limpar(): void {
    this.produtos = [];
    this.contadorId = 1;
  }
}
