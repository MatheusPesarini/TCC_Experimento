
export type StatusPedido = 'pendente' | 'confirmado' | 'enviado' | 'entregue' | 'cancelado';

export interface ItemPedido {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
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

export interface ItemPedidoInput {
  produtoId: number;
  quantidade: number;
}

export interface CriarPedidoDTO {
  clienteNome: string;
  clienteEmail: string;
  clienteEndereco: string;
  itens: ItemPedidoInput[];
  desconto: number;
}

export interface AtualizarStatusDTO {
  novoStatus: StatusPedido;
}

export interface FiltrosPedido {
  status?: StatusPedido;
  clienteEmail?: string;
}
