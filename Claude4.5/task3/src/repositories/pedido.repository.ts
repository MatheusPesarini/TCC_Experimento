import { Pedido, StatusPedido } from '../types/pedido.types';

class PedidoRepository {
  private pedidos: Pedido[] = [];
  private nextId: number = 1;

  create(pedido: Omit<Pedido, 'id'>): Pedido {
    const novoPedido: Pedido = {
      ...pedido,
      id: this.nextId++
    };
    this.pedidos.push(novoPedido);
    return novoPedido;
  }

  findAll(filters?: { status?: StatusPedido; clienteEmail?: string }): Pedido[] {
    let result = this.pedidos;

    if (filters?.status) {
      result = result.filter(p => p.status === filters.status);
    }

    if (filters?.clienteEmail) {
      result = result.filter(p => p.clienteEmail === filters.clienteEmail);
    }

    return result;
  }

  findById(id: number): Pedido | undefined {
    return this.pedidos.find(p => p.id === id);
  }

  update(id: number, updates: Partial<Pedido>): Pedido | undefined {
    const index = this.pedidos.findIndex(p => p.id === id);

    if (index === -1) {
      return undefined;
    }

    this.pedidos[index] = {
      ...this.pedidos[index],
      ...updates,
      dataAtualizacao: new Date().toISOString()
    };

    return this.pedidos[index];
  }

  delete(id: number): boolean {
    const index = this.pedidos.findIndex(p => p.id === id);

    if (index === -1) {
      return false;
    }

    this.pedidos.splice(index, 1);
    return true;
  }

  findPedidosComProduto(produtoId: number): Pedido[] {
    return this.pedidos.filter(pedido =>
      pedido.status !== 'cancelado' &&
      pedido.itens.some(item => item.produtoId === produtoId)
    );
  }
}

export default new PedidoRepository();
