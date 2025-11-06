// filepath: c:\Users\mathe\Desktop\TCC_Experimento\GPT-5\task3\src\services\orderService.ts
import { ordersRepository } from '../repositories/ordersRepository.js';
import { productsRepository } from '../repositories/productsRepository.js';
import {
  ItemPedido,
  Pedido,
  PedidoCreateInput,
  PedidoItemInput,
  StatusPedido,
} from '../types/index.js';
import { fromCents, hasAtMostTwoDecimals, isPositiveInteger, sumCents, toCents } from '../utils/money.js';
import { isNonEmptyString, isValidEmail } from '../utils/validation.js';

const allowedTransitions: Record<StatusPedido, StatusPedido[]> = {
  pendente: ['confirmado'],
  confirmado: ['enviado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: [],
};

export class OrderService {
  create(input: any): { ok: true; value: Pedido } | { ok: false; code: number; message: string } {
    const parsed = this.validateCreateInput(input);
    if (!parsed.ok) return parsed;

    const { clienteNome, clienteEmail, clienteEndereco, itens, desconto } = parsed.value;

    // Verificar existência, ativo e estoque suficiente (fase 1)
    const produtosInfo = itens.map(it => {
      const produto = productsRepository.getById(it.produtoId);
      return { it, produto };
    });

    for (const { it, produto } of produtosInfo) {
      if (!produto) return { ok: false, code: 404, message: 'Produto não encontrado' };
      if (!produto.ativo) return { ok: false, code: 409, message: 'Produto inativo' };
      if (produto.quantidadeEstoque < it.quantidade) return { ok: false, code: 409, message: 'Estoque insuficiente' };
    }

    // Montar itens com snapshot e calcular totais (centavos)
    const itensSnapshot: ItemPedido[] = itens.map(({ produtoId, quantidade }) => {
      const produto = productsRepository.getById(produtoId)!;
      const precoUnitCents = toCents(produto.preco);
      const subtotalCents = precoUnitCents * quantidade;
      return {
        produtoId,
        nomeProduto: produto.nome,
        quantidade,
        precoUnitario: fromCents(precoUnitCents),
        subtotal: fromCents(subtotalCents),
      };
    });

    const subtotalCents = sumCents(itensSnapshot.map(i => toCents(i.subtotal)));
    const descontoCents = toCents(desconto ?? 0);
    if (descontoCents < 0 || descontoCents > subtotalCents) {
      return { ok: false, code: 400, message: 'Desconto inválido' };
    }
    const totalCents = subtotalCents - descontoCents;

    // Debitar estoque atomicamente (fase 2)
    for (const { it, produto } of produtosInfo) {
      // produto garantido
      produto!.quantidadeEstoque -= it.quantidade;
    }

    const now = new Date().toISOString();
    const pedido = ordersRepository.create({
      clienteNome,
      clienteEmail,
      clienteEndereco,
      itens: itensSnapshot,
      subtotal: fromCents(subtotalCents),
      desconto: fromCents(descontoCents),
      total: fromCents(totalCents),
      status: 'pendente',
      dataDoPedido: now,
      dataAtualizacao: now,
    });

    return { ok: true, value: pedido };
  }

  private validateCreateInput(body: any): { ok: true; value: PedidoCreateInput } | { ok: false; code: number; message: string } {
    if (!isNonEmptyString(body?.clienteNome) || !isNonEmptyString(body?.clienteEndereco)) {
      return { ok: false, code: 400, message: 'Campos obrigatórios inválidos' };
    }
    if (!isValidEmail(body?.clienteEmail)) {
      return { ok: false, code: 400, message: 'Email inválido' };
    }
    if (!Array.isArray(body?.itens) || body.itens.length === 0) {
      return { ok: false, code: 400, message: 'Itens inválidos' };
    }
    const itens: PedidoItemInput[] = [];
    for (const raw of body.itens) {
      if (typeof raw?.produtoId !== 'number' || !isPositiveInteger(raw?.quantidade)) {
        return { ok: false, code: 400, message: 'Item inválido' };
      }
      itens.push({ produtoId: raw.produtoId, quantidade: raw.quantidade });
    }
    if (body.desconto !== undefined) {
      if (typeof body.desconto !== 'number' || body.desconto < 0 || !hasAtMostTwoDecimals(body.desconto)) {
        return { ok: false, code: 400, message: 'Desconto inválido' };
      }
    }
    const desconto = body.desconto ?? 0;
    return {
      ok: true,
      value: {
        clienteNome: body.clienteNome,
        clienteEmail: body.clienteEmail,
        clienteEndereco: body.clienteEndereco,
        itens,
        desconto,
      },
    };
  }

  list(filters: { status?: string; clienteEmail?: string }): Pedido[] {
    let status: StatusPedido | undefined = undefined;
    if (filters.status && ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'].includes(filters.status)) {
      status = filters.status as StatusPedido;
    }
    return ordersRepository.list({ status, clienteEmail: filters.clienteEmail });
  }

  getById(id: number): Pedido | undefined {
    return ordersRepository.getById(id);
  }

  updateStatus(id: number, novoStatus: any): { ok: true; value: Pedido } | { ok: false; code: number; message: string } {
    const pedido = ordersRepository.getById(id);
    if (!pedido) return { ok: false, code: 404, message: 'Pedido não encontrado' };
    if (typeof novoStatus !== 'string' || !['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'].includes(novoStatus)) {
      return { ok: false, code: 400, message: 'Status inválido' };
    }
    if (pedido.status === 'cancelado') {
      return { ok: false, code: 409, message: 'Pedido cancelado' };
    }
    const allowed = allowedTransitions[pedido.status];
    if (!allowed.includes(novoStatus as StatusPedido)) {
      return { ok: false, code: 400, message: 'Transição inválida' };
    }
    pedido.status = novoStatus as StatusPedido;
    pedido.dataAtualizacao = new Date().toISOString();
    ordersRepository.update(pedido);
    return { ok: true, value: pedido };
  }

  cancel(id: number): { ok: true; value: Pedido } | { ok: false; code: number; message: string } {
    const pedido = ordersRepository.getById(id);
    if (!pedido) return { ok: false, code: 404, message: 'Pedido não encontrado' };
    if (pedido.status === 'cancelado') return { ok: false, code: 409, message: 'Já cancelado' };
    if (pedido.status === 'entregue') return { ok: false, code: 409, message: 'Já entregue' };

    // retornar estoque
    for (const item of pedido.itens) {
      const prod = productsRepository.getById(item.produtoId);
      if (prod) {
        prod.quantidadeEstoque += item.quantidade;
      }
    }
    pedido.status = 'cancelado';
    pedido.dataAtualizacao = new Date().toISOString();
    ordersRepository.update(pedido);
    return { ok: true, value: pedido };
  }

  delete(id: number): { ok: true } | { ok: false; code: number; message: string } {
    const pedido = ordersRepository.getById(id);
    if (!pedido) return { ok: false, code: 404, message: 'Pedido não encontrado' };
    if (pedido.status !== 'pendente') return { ok: false, code: 409, message: 'Apenas pendente pode ser deletado' };

    // restaurar estoque
    for (const item of pedido.itens) {
      const prod = productsRepository.getById(item.produtoId);
      if (prod) {
        prod.quantidadeEstoque += item.quantidade;
      }
    }
    ordersRepository.delete(id);
    return { ok: true };
  }
}

export const orderService = new OrderService();
