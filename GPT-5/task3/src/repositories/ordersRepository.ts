// filepath: c:\Users\mathe\Desktop\TCC_Experimento\GPT-5\task3\src\repositories\ordersRepository.ts
import { Pedido, StatusPedido } from '../types/index.js';

export class OrdersRepository {
  private orders: Pedido[] = [];
  private nextId = 1;

  create(pedido: Omit<Pedido, 'id'>): Pedido {
    const o: Pedido = { ...pedido, id: this.nextId++ };
    this.orders.push(o);
    return o;
  }

  list(filters?: { status?: StatusPedido; clienteEmail?: string }): Pedido[] {
    let arr = [...this.orders];
    if (filters?.status) arr = arr.filter(o => o.status === filters.status);
    if (filters?.clienteEmail) arr = arr.filter(o => o.clienteEmail === filters.clienteEmail);
    return arr;
  }

  getById(id: number): Pedido | undefined {
    return this.orders.find(o => o.id === id);
  }

  update(pedido: Pedido): Pedido {
    const idx = this.orders.findIndex(o => o.id === pedido.id);
    if (idx !== -1) this.orders[idx] = pedido;
    return pedido;
  }

  delete(id: number): boolean {
    const idx = this.orders.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.orders.splice(idx, 1);
    return true;
  }

  hasActiveOrdersForProduct(produtoId: number): boolean {
    return this.orders.some(o => o.status !== 'cancelado' && o.itens.some(i => i.produtoId === produtoId));
  }
}

export const ordersRepository = new OrdersRepository();
