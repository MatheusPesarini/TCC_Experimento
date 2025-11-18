// filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\GPT-5\task3\src\utils\validation.ts
import { Pedido, Produto, StatusPedido } from '../types.js';

export function isPositiveInteger(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

export function isNonNegativeInteger(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 0;
}

export function isValidPrice(n: unknown): n is number {
  // Número positivo com no máximo 2 casas decimais.
  // Checamos se multiplicado por 100 continua inteiro (evita >2 decimais).
  // Usamos arredondamento de segurança para minimizar efeitos de imprecisão binária.
  if (typeof n !== 'number' || !isFinite(n) || n <= 0) return false;
  const scaled = n * 100;
  // Pequena tolerância para erros de ponto flutuante (ex: 10.3399999997)
  const epsilon = 1e-8;
  return Math.abs(Math.round(scaled) - scaled) < epsilon;
}

export function isEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  // Simples regex controlada (evita ReDoS) cobrindo formato básico
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
}

export function parseIdParam(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function validateProdutoPost(body: any): string | null {
  const { nome, descricao, preco, categoria, quantidadeEstoque, estoqueMinimo } = body;
  if (!nome || typeof nome !== 'string' || !nome.trim()) return 'nome inválido';
  if (!descricao || typeof descricao !== 'string' || !descricao.trim()) return 'descricao inválida';
  if (!categoria || typeof categoria !== 'string' || !categoria.trim()) return 'categoria inválida';
  if (!isValidPrice(preco)) return 'preco inválido';
  if (!isNonNegativeInteger(quantidadeEstoque)) return 'quantidadeEstoque inválido';
  if (!isNonNegativeInteger(estoqueMinimo)) return 'estoqueMinimo inválido';
  return null;
}

export function validateProdutoPatch(body: any): string | null {
  if (!body || Object.keys(body).length === 0) return 'body vazio';
  if (body.preco !== undefined && !isValidPrice(body.preco)) return 'preco inválido';
  if (body.quantidadeEstoque !== undefined && !isNonNegativeInteger(body.quantidadeEstoque)) return 'quantidadeEstoque inválido';
  if (body.estoqueMinimo !== undefined && !isNonNegativeInteger(body.estoqueMinimo)) return 'estoqueMinimo inválido';
  if (body.nome !== undefined && (typeof body.nome !== 'string' || !body.nome.trim())) return 'nome inválido';
  if (body.descricao !== undefined && (typeof body.descricao !== 'string' || !body.descricao.trim())) return 'descricao inválida';
  if (body.categoria !== undefined && (typeof body.categoria !== 'string' || !body.categoria.trim())) return 'categoria inválida';
  if (body.ativo !== undefined && typeof body.ativo !== 'boolean') return 'ativo inválido';
  return null;
}

export function validatePedidoPost(body: any): string | null {
  const { clienteNome, clienteEmail, clienteEndereco, itens, desconto } = body;
  if (!clienteNome || typeof clienteNome !== 'string' || !clienteNome.trim()) return 'clienteNome inválido';
  if (!clienteEndereco || typeof clienteEndereco !== 'string' || !clienteEndereco.trim()) return 'clienteEndereco inválido';
  if (!isEmail(clienteEmail)) return 'clienteEmail inválido';
  if (!Array.isArray(itens) || itens.length === 0) return 'itens vazio';
  for (const it of itens) {
    if (!isPositiveInteger(it.produtoId)) return 'item produtoId inválido';
    if (!isPositiveInteger(it.quantidade)) return 'item quantidade inválida';
  }
  if (desconto !== undefined) {
    if (typeof desconto !== 'number' || desconto < 0) return 'desconto inválido';
  }
  return null;
}

export function validateNovoStatus(novoStatus: any): novoStatus is StatusPedido {
  return ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'].includes(novoStatus);
}

export function canTransition(current: StatusPedido, next: StatusPedido): boolean {
  const allowed: Record<StatusPedido, StatusPedido[]> = {
    pendente: ['confirmado'],
    confirmado: ['enviado'],
    enviado: ['entregue'],
    entregue: [],
    cancelado: []
  };
  return allowed[current].includes(next);
}

export function produtoEmPedidosNaoCancelados(produtoId: number, pedidos: Pedido[]): boolean {
  return pedidos.some(p => p.status !== 'cancelado' && p.itens.some(i => i.produtoId === produtoId));
}
