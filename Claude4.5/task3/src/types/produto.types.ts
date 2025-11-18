
export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  dataDeCadastro: string;
}

export interface CriarProdutoDTO {
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  quantidadeEstoque: number;
  estoqueMinimo: number;
}

export interface AtualizarProdutoDTO {
  nome?: string;
  descricao?: string;
  preco?: number;
  categoria?: string;
  quantidadeEstoque?: number;
  estoqueMinimo?: number;
  ativo?: boolean;
}

export interface FiltrosProduto {
  categoria?: string;
  ativo?: boolean;
}
