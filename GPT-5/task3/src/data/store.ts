// filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\GPT-5\task3\src\data\store.ts
import { Produto, Pedido } from '../types.js';

export const produtos: Produto[] = [];
export const pedidos: Pedido[] = [];

let produtoSeq = 1;
let pedidoSeq = 1;

export function nextProdutoId(): number {
  return produtoSeq++;
}

export function nextPedidoId(): number {
  return pedidoSeq++;
}
