import pedidoRepository from '../repositories/pedido.repository.js';
import produtoRepository from '../repositories/produto.repository.js';
import { CreatePedidoDTO, Pedido, StatusPedido, ItemPedido } from '../types/pedido.types.js';
import { BadRequestError, NotFoundError, ConflictError } from '../types/errors.types.js';
import { isValidEmail, roundToTwo } from '../utils/validators.js';

class PedidoService {
  create(data: CreatePedidoDTO): Pedido {
    // Validações básicas
    if (!data.clienteNome || data.clienteNome.trim() === '') {
      throw new BadRequestError('Nome do cliente é obrigatório');
    }

    if (!data.clienteEmail || data.clienteEmail.trim() === '') {
      throw new BadRequestError('Email do cliente é obrigatório');
    }

    if (!isValidEmail(data.clienteEmail)) {
      throw new BadRequestError('Email inválido');
    }

    if (!data.clienteEndereco || data.clienteEndereco.trim() === '') {
      throw new BadRequestError('Endereço do cliente é obrigatório');
    }

    if (!data.itens || !Array.isArray(data.itens) || data.itens.length === 0) {
      throw new BadRequestError('Pedido deve ter pelo menos um item');
    }

    if (data.desconto === undefined || data.desconto === null) {
      throw new BadRequestError('Desconto é obrigatório');
    }

    if (data.desconto < 0) {
      throw new BadRequestError('Desconto não pode ser negativo');
    }

    // Validar itens
    for (const item of data.itens) {
      if (!Number.isInteger(item.produtoId) || item.produtoId <= 0) {
        throw new BadRequestError('ID do produto inválido');
      }

      if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
        throw new BadRequestError('Quantidade deve ser um inteiro positivo');
      }
    }

    // Verificar produtos existem e estão ativos
    const itensComSnapshot: ItemPedido[] = [];
    const estoqueReservado: Array<{ produtoId: number; quantidade: number }> = [];

    try {
      for (const item of data.itens) {
        const produto = produtoRepository.findById(item.produtoId);

        if (!produto) {
          throw new NotFoundError(`Produto com ID ${item.produtoId} não encontrado`);
        }

        if (!produto.ativo) {
          throw new ConflictError(`Produto ${produto.nome} está inativo`);
        }

        if (produto.quantidadeEstoque < item.quantidade) {
          throw new ConflictError(`Estoque insuficiente para o produto ${produto.nome}`);
        }

        // Criar snapshot do item
        const subtotal = roundToTwo(item.quantidade * produto.preco);

        itensComSnapshot.push({
          produtoId: item.produtoId,
          nomeProduto: produto.nome,
          quantidade: item.quantidade,
          precoUnitario: produto.preco,
          subtotal
        });

        estoqueReservado.push({
          produtoId: item.produtoId,
          quantidade: item.quantidade
        });
      }

      // Validar todas as reservas de estoque antes de decrementar
      for (const reserva of estoqueReservado) {
        const produto = produtoRepository.findById(reserva.produtoId);
        if (!produto || produto.quantidadeEstoque < reserva.quantidade) {
          throw new ConflictError('Estoque insuficiente para processar o pedido');
        }
      }

      // Calcular subtotal e total
      const subtotal = roundToTwo(
        itensComSnapshot.reduce((acc, item) => acc + item.subtotal, 0)
      );

      if (data.desconto > subtotal) {
        throw new BadRequestError('Desconto não pode ser maior que o subtotal');
      }

      const total = roundToTwo(subtotal - data.desconto);

      // Decrementar estoque (atomicamente)
      for (const reserva of estoqueReservado) {
        const success = produtoRepository.decrementarEstoque(
          reserva.produtoId,
          reserva.quantidade
        );

        if (!success) {
          // Reverter todas as operações anteriores
          for (let i = 0; i < estoqueReservado.indexOf(reserva); i++) {
            produtoRepository.incrementarEstoque(
              estoqueReservado[i].produtoId,
              estoqueReservado[i].quantidade
            );
          }
          throw new ConflictError('Erro ao processar estoque');
        }
      }

      // Criar pedido
      const novoPedido: Omit<Pedido, 'id'> = {
        clienteNome: data.clienteNome.trim(),
        clienteEmail: data.clienteEmail.trim(),
        clienteEndereco: data.clienteEndereco.trim(),
        itens: itensComSnapshot,
        subtotal,
        desconto: data.desconto,
        total,
        status: 'pendente',
        dataDoPedido: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };

      return pedidoRepository.create(novoPedido);
    } catch (error) {
      // Em caso de erro, não decrementamos nada (já revertido no catch interno)
      throw error;
    }
  }

  findAll(filters?: { status?: string; clienteEmail?: string }): Pedido[] {
    const parsedFilters: { status?: StatusPedido; clienteEmail?: string } = {};

    if (filters?.status) {
      const validStatus = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];
      if (validStatus.includes(filters.status)) {
        parsedFilters.status = filters.status as StatusPedido;
      }
    }

    if (filters?.clienteEmail) {
      parsedFilters.clienteEmail = filters.clienteEmail;
    }

    return pedidoRepository.findAll(parsedFilters);
  }

  findById(id: number): Pedido {
    const pedido = pedidoRepository.findById(id);

    if (!pedido) {
      throw new NotFoundError('Pedido não encontrado');
    }

    return pedido;
  }

  updateStatus(id: number, novoStatus: StatusPedido): Pedido {
    const pedido = pedidoRepository.findById(id);

    if (!pedido) {
      throw new NotFoundError('Pedido não encontrado');
    }

    if (pedido.status === 'cancelado') {
      throw new ConflictError('Não é possível alterar status de pedido cancelado');
    }

    // Validar status
    const validStatus = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];
    if (!validStatus.includes(novoStatus)) {
      throw new BadRequestError('Status inválido');
    }

    // Validar transições
    const transicoesValidas: Record<StatusPedido, StatusPedido[]> = {
      pendente: ['confirmado'],
      confirmado: ['enviado'],
      enviado: ['entregue'],
      entregue: [],
      cancelado: []
    };

    if (!transicoesValidas[pedido.status].includes(novoStatus)) {
      throw new BadRequestError(`Transição de ${pedido.status} para ${novoStatus} não é permitida`);
    }

    const updated = pedidoRepository.update(id, { status: novoStatus });

    if (!updated) {
      throw new NotFoundError('Pedido não encontrado');
    }

    return updated;
  }

  cancel(id: number): Pedido {
    const pedido = pedidoRepository.findById(id);

    if (!pedido) {
      throw new NotFoundError('Pedido não encontrado');
    }

    if (pedido.status === 'cancelado') {
      throw new ConflictError('Pedido já está cancelado');
    }

    if (pedido.status === 'entregue') {
      throw new ConflictError('Não é possível cancelar pedido já entregue');
    }

    // Retornar estoque
    for (const item of pedido.itens) {
      produtoRepository.incrementarEstoque(item.produtoId, item.quantidade);
    }

    const updated = pedidoRepository.update(id, { status: 'cancelado' });

    if (!updated) {
      throw new NotFoundError('Pedido não encontrado');
    }

    return updated;
  }

  delete(id: number): void {
    const pedido = pedidoRepository.findById(id);

    if (!pedido) {
      throw new NotFoundError('Pedido não encontrado');
    }

    if (pedido.status !== 'pendente') {
      throw new ConflictError('Apenas pedidos pendentes podem ser deletados');
    }

    // Retornar estoque
    for (const item of pedido.itens) {
      produtoRepository.incrementarEstoque(item.produtoId, item.quantidade);
    }

    pedidoRepository.delete(id);
  }
}

export default new PedidoService();
