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

export interface CreatePedidoDTO {
  clienteNome: string;
  clienteEmail: string;
  clienteEndereco: string;
  itens: CreateItemPedidoDTO[];
  desconto: number;
}

export interface CreateItemPedidoDTO {
  produtoId: number;
  quantidade: number;
}
