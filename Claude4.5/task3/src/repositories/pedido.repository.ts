
import { PedidoModel } from '../models/pedido.model.js';
import { Pedido, FiltrosPedido } from '../types/pedido.types.js';

export class PedidoRepository {
  buscarPorId(id: number): Pedido | undefined {
    return PedidoModel.buscarPorId(id);
  }

  buscarTodos(filtros?: FiltrosPedido): Pedido[] {
    let pedidos = PedidoModel.buscarTodos();

    if (filtros?.status) {
      pedidos = pedidos.filter(p => p.status === filtros.status);
    }

    if (filtros?.clienteEmail) {
      pedidos = pedidos.filter(p => p.clienteEmail === filtros.clienteEmail);
    }

    return pedidos;
  }

  criar(pedido: Omit<Pedido, 'id'>): Pedido {
    return PedidoModel.criar(pedido);
  }

  atualizar(id: number, updates: Partial<Pedido>): Pedido | undefined {
    return PedidoModel.atualizar(id, updates);
  }

  deletar(id: number): boolean {
    return PedidoModel.deletar(id);
  }

  buscarPedidosComProduto(produtoId: number): Pedido[] {
    return PedidoModel.buscarTodos().filter(pedido =>
      pedido.itens.some(item => item.produtoId === produtoId)
    );
  }
}
