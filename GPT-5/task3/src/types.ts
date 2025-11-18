// filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\GPT-5\task3\src\types.ts

export type StatusPedido = 'pendente' | 'confirmado' | 'enviado' | 'entregue' | 'cancelado';

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  dataDeCadastro: string; // ISO 8601
}

export interface ItemPedido {
  produtoId: number;
  nomeProduto: string; // snapshot
  quantidade: number;
  precoUnitario: number; // snapshot
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

export interface ErrorPayload {
  error: string;
}
