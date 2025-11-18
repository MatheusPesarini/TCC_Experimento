
import { Pedido, ItemPedido } from '../types/pedido.types.js';

export class PedidoModel {
  private static contadorId = 1;
  private static pedidos: Pedido[] = [];

  static criar(pedido: Omit<Pedido, 'id'>): Pedido {
    const novoPedido: Pedido = {
      id: this.contadorId++,
      ...pedido
    };

    this.pedidos.push(novoPedido);
    return novoPedido;
  }

  static buscarPorId(id: number): Pedido | undefined {
    return this.pedidos.find(p => p.id === id);
  }

  static buscarTodos(): Pedido[] {
    return [...this.pedidos];
  }

  static atualizar(id: number, updates: Partial<Pedido>): Pedido | undefined {
    const index = this.pedidos.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.pedidos[index] = {
      ...this.pedidos[index],
      ...updates,
      dataAtualizacao: new Date().toISOString()
    };
    return this.pedidos[index];
  }

  static deletar(id: number): boolean {
    const index = this.pedidos.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.pedidos.splice(index, 1);
    return true;
  }

  static limpar(): void {
    this.pedidos = [];
    this.contadorId = 1;
  }
}
