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

export interface CreateProdutoDTO {
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  quantidadeEstoque: number;
  estoqueMinimo: number;
}

export interface UpdateProdutoDTO {
  nome?: string;
  descricao?: string;
  preco?: number;
  categoria?: string;
  quantidadeEstoque?: number;
  estoqueMinimo?: number;
  ativo?: boolean;
}
