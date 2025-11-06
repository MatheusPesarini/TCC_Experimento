// filepath: c:\Users\mathe\Desktop\TCC_Experimento\GPT-5\task3\src\types\index.ts
export type StatusPedido = 'pendente' | 'confirmado' | 'enviado' | 'entregue' | 'cancelado';

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number; // até 2 casas decimais
  categoria: string;
  quantidadeEstoque: number; // inteiro >= 0
  estoqueMinimo: number; // inteiro >= 0
  ativo: boolean; // padrão true
  dataDeCadastro: string; // ISO 8601
}

export interface ItemPedido {
  produtoId: number;
  nomeProduto: string; // snapshot
  quantidade: number; // inteiro > 0
  precoUnitario: number; // snapshot do preço
  subtotal: number; // quantidade * precoUnitario
}

export interface Pedido {
  id: number;
  clienteNome: string;
  clienteEmail: string;
  clienteEndereco: string;
  itens: ItemPedido[];
  subtotal: number;
  desconto: number;
  total: number;
  status: StatusPedido;
  dataDoPedido: string;
  dataAtualizacao: string;
}

export type ProdutoCreateInput = Omit<Produto, 'id' | 'ativo' | 'dataDeCadastro'> & Partial<Pick<Produto, 'ativo'>>;
export type ProdutoUpdateInput = Partial<Omit<Produto, 'id' | 'dataDeCadastro'>>;

export type PedidoItemInput = {
  produtoId: number;
  quantidade: number;
};

export type PedidoCreateInput = {
  clienteNome: string;
  clienteEmail: string;
  clienteEndereco: string;
  itens: PedidoItemInput[];
  desconto?: number;
};
