
import { ProdutoRepository } from '../repositories/produto.repository.js';
import {
  Produto,
  CriarProdutoDTO,
  AtualizarProdutoDTO,
  FiltrosProduto
} from '../types/produto.types.js';
import { PedidoRepository } from '../repositories/pedido.repository.js';

export class ProdutoService {
  private produtoRepository: ProdutoRepository;
  private pedidoRepository: PedidoRepository;

  constructor() {
    this.produtoRepository = new ProdutoRepository();
    this.pedidoRepository = new PedidoRepository();
  }

  criar(dto: CriarProdutoDTO): Produto {
    return this.produtoRepository.criar(dto);
  }

  buscarPorId(id: number): Produto | null {
    const produto = this.produtoRepository.buscarPorId(id);
    return produto || null;
  }

  buscarTodos(filtros?: FiltrosProduto): Produto[] {
    return this.produtoRepository.buscarTodos(filtros);
  }

  atualizar(id: number, dto: AtualizarProdutoDTO): Produto | null {
    const produto = this.produtoRepository.buscarPorId(id);
    if (!produto) return null;

    const atualizado = this.produtoRepository.atualizar(id, dto);
    return atualizado || null;
  }

  deletar(id: number): { sucesso: boolean; erro?: string } {
    const produto = this.produtoRepository.buscarPorId(id);
    if (!produto) {
      return { sucesso: false, erro: 'not_found' };
    }

    // Verificar se o produto está em pedidos não cancelados
    const pedidos = this.pedidoRepository.buscarPedidosComProduto(id);
    const pedidosAtivos = pedidos.filter(p => p.status !== 'cancelado');

    if (pedidosAtivos.length > 0) {
      return { sucesso: false, erro: 'conflict' };
    }

    const deletado = this.produtoRepository.deletar(id);
    return { sucesso: deletado };
  }
}
