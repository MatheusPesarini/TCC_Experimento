
import { ProdutoRepository } from '../repositories/produto.repository.js';
import { PedidoRepository } from '../repositories/pedido.repository.js';
import {
  Pedido,
  CriarPedidoDTO,
  ItemPedido,
  StatusPedido,
  FiltrosPedido
} from '../types/pedido.types.js';
import { arredondarDuasCasas } from '../utils/validators.js';

export class PedidoService {
  private produtoRepository: ProdutoRepository;
  private pedidoRepository: PedidoRepository;

  constructor() {
    this.produtoRepository = new ProdutoRepository();
    this.pedidoRepository = new PedidoRepository();
  }

  criar(dto: CriarPedidoDTO): { sucesso: boolean; pedido?: Pedido; erro?: string; detalhes?: string } {
    // Validar que todos os produtos existem e estão ativos
    const produtos: Array<{ id: number; nome: string; preco: number; quantidadeEstoque: number; ativo: boolean }> = [];
    for (const item of dto.itens) {
      const produto = this.produtoRepository.buscarPorId(item.produtoId);

      if (!produto) {
        return { sucesso: false, erro: 'not_found', detalhes: `Produto ${item.produtoId} não encontrado` };
      }

      if (!produto.ativo) {
        return { sucesso: false, erro: 'conflict', detalhes: `Produto ${produto.nome} está inativo` };
      }

      if (produto.quantidadeEstoque < item.quantidade) {
        return { sucesso: false, erro: 'conflict', detalhes: `Estoque insuficiente para o produto ${produto.nome}` };
      }

      produtos.push(produto);
    }

    // Calcular itens com snapshots
    const itens: ItemPedido[] = dto.itens.map((item, index) => {
      const produto = produtos[index];
      const precoUnitario = arredondarDuasCasas(produto.preco);
      const subtotal = arredondarDuasCasas(item.quantidade * precoUnitario);

      return {
        produtoId: item.produtoId,
        nomeProduto: produto.nome,
        quantidade: item.quantidade,
        precoUnitario,
        subtotal
      };
    });

    // Calcular valores
    const subtotal = arredondarDuasCasas(itens.reduce((acc, item) => acc + item.subtotal, 0));
    const desconto = dto.desconto || 0;

    // Validar desconto
    if (desconto > subtotal) {
      return { sucesso: false, erro: 'bad_request', detalhes: 'Desconto não pode ser maior que o subtotal' };
    }

    const total = arredondarDuasCasas(subtotal - desconto);

    // Decrementar estoque atomicamente
    const estoqueDecrementado: { id: number; quantidade: number }[] = [];

    try {
      for (let i = 0; i < dto.itens.length; i++) {
        const item = dto.itens[i];
        const sucesso = this.produtoRepository.decrementarEstoque(item.produtoId, item.quantidade);

        if (!sucesso) {
          // Reverter decrementos anteriores
          for (const dec of estoqueDecrementado) {
            this.produtoRepository.incrementarEstoque(dec.id, dec.quantidade);
          }
          return { sucesso: false, erro: 'conflict', detalhes: 'Falha ao reservar estoque' };
        }

        estoqueDecrementado.push({ id: item.produtoId, quantidade: item.quantidade });
      }
    } catch (error) {
      // Reverter em caso de erro
      for (const dec of estoqueDecrementado) {
        this.produtoRepository.incrementarEstoque(dec.id, dec.quantidade);
      }
      throw error;
    }

    // Criar pedido
    const agora = new Date().toISOString();
    const pedido = this.pedidoRepository.criar({
      clienteNome: dto.clienteNome,
      clienteEmail: dto.clienteEmail,
      clienteEndereco: dto.clienteEndereco,
      itens,
      subtotal,
      desconto,
      total,
      status: 'pendente',
      dataDoPedido: agora,
      dataAtualizacao: agora
    });

    return { sucesso: true, pedido };
  }

  buscarPorId(id: number): Pedido | null {
    const pedido = this.pedidoRepository.buscarPorId(id);
    return pedido || null;
  }

  buscarTodos(filtros?: FiltrosPedido): Pedido[] {
    return this.pedidoRepository.buscarTodos(filtros);
  }

  atualizarStatus(id: number, novoStatus: StatusPedido): { sucesso: boolean; pedido?: Pedido; erro?: string; detalhes?: string } {
    const pedido = this.pedidoRepository.buscarPorId(id);

    if (!pedido) {
      return { sucesso: false, erro: 'not_found' };
    }

    if (pedido.status === 'cancelado') {
      return { sucesso: false, erro: 'conflict', detalhes: 'Pedido cancelado não pode ter status alterado' };
    }

    // Validar transições
    const transicoesValidas: Record<StatusPedido, StatusPedido[]> = {
      pendente: ['confirmado'],
      confirmado: ['enviado'],
      enviado: ['entregue'],
      entregue: [],
      cancelado: []
    };

    const permitido = transicoesValidas[pedido.status] || [];

    if (!permitido.includes(novoStatus)) {
      return { sucesso: false, erro: 'bad_request', detalhes: `Transição de ${pedido.status} para ${novoStatus} não é permitida` };
    }

    const atualizado = this.pedidoRepository.atualizar(id, { status: novoStatus });
    return { sucesso: true, pedido: atualizado! };
  }

  cancelar(id: number): { sucesso: boolean; pedido?: Pedido; erro?: string; detalhes?: string } {
    const pedido = this.pedidoRepository.buscarPorId(id);

    if (!pedido) {
      return { sucesso: false, erro: 'not_found' };
    }

    if (pedido.status === 'cancelado') {
      return { sucesso: false, erro: 'conflict', detalhes: 'Pedido já está cancelado' };
    }

    if (pedido.status === 'entregue') {
      return { sucesso: false, erro: 'conflict', detalhes: 'Pedido entregue não pode ser cancelado' };
    }

    // Retornar estoque
    for (const item of pedido.itens) {
      this.produtoRepository.incrementarEstoque(item.produtoId, item.quantidade);
    }

    const atualizado = this.pedidoRepository.atualizar(id, { status: 'cancelado' });
    return { sucesso: true, pedido: atualizado! };
  }

  deletar(id: number): { sucesso: boolean; erro?: string; detalhes?: string } {
    const pedido = this.pedidoRepository.buscarPorId(id);

    if (!pedido) {
      return { sucesso: false, erro: 'not_found' };
    }

    if (pedido.status !== 'pendente') {
      return { sucesso: false, erro: 'conflict', detalhes: 'Apenas pedidos pendentes podem ser deletados' };
    }

    // Retornar estoque
    for (const item of pedido.itens) {
      this.produtoRepository.incrementarEstoque(item.produtoId, item.quantidade);
    }

    const deletado = this.pedidoRepository.deletar(id);
    return { sucesso: deletado };
  }
}
