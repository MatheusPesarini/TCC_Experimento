import produtoRepository from '../repositories/produto.repository.js';
import pedidoRepository from '../repositories/pedido.repository.js';
import { CreateProdutoDTO, UpdateProdutoDTO, Produto } from '../types/produto.types.js';
import { BadRequestError, NotFoundError, ConflictError } from '../types/errors.types.js';
import { hasMaxTwoDecimals, isPositiveInteger } from '../utils/validators.js';

class ProdutoService {
  create(data: CreateProdutoDTO): Produto {
    // Validações
    if (!data.nome || data.nome.trim() === '') {
      throw new BadRequestError('Nome é obrigatório');
    }

    if (!data.descricao || data.descricao.trim() === '') {
      throw new BadRequestError('Descrição é obrigatória');
    }

    if (!data.categoria || data.categoria.trim() === '') {
      throw new BadRequestError('Categoria é obrigatória');
    }

    if (data.preco === undefined || data.preco === null) {
      throw new BadRequestError('Preço é obrigatório');
    }

    if (data.preco <= 0) {
      throw new BadRequestError('Preço deve ser maior que zero');
    }

    if (!hasMaxTwoDecimals(data.preco)) {
      throw new BadRequestError('Preço deve ter no máximo 2 casas decimais');
    }

    if (data.quantidadeEstoque === undefined || data.quantidadeEstoque === null) {
      throw new BadRequestError('Quantidade em estoque é obrigatória');
    }

    if (!isPositiveInteger(data.quantidadeEstoque)) {
      throw new BadRequestError('Quantidade em estoque deve ser um inteiro não negativo');
    }

    if (data.estoqueMinimo === undefined || data.estoqueMinimo === null) {
      throw new BadRequestError('Estoque mínimo é obrigatório');
    }

    if (!isPositiveInteger(data.estoqueMinimo)) {
      throw new BadRequestError('Estoque mínimo deve ser um inteiro não negativo');
    }

    const produto: Omit<Produto, 'id'> = {
      nome: data.nome.trim(),
      descricao: data.descricao.trim(),
      preco: data.preco,
      categoria: data.categoria.trim(),
      quantidadeEstoque: data.quantidadeEstoque,
      estoqueMinimo: data.estoqueMinimo,
      ativo: true,
      dataDeCadastro: new Date().toISOString()
    };

    return produtoRepository.create(produto);
  }

  findAll(filters?: { categoria?: string; ativo?: string }): Produto[] {
    const parsedFilters: { categoria?: string; ativo?: boolean } = {};

    if (filters?.categoria) {
      parsedFilters.categoria = filters.categoria;
    }

    if (filters?.ativo !== undefined) {
      parsedFilters.ativo = filters.ativo === 'true';
    }

    return produtoRepository.findAll(parsedFilters);
  }

  findById(id: number): Produto {
    const produto = produtoRepository.findById(id);

    if (!produto) {
      throw new NotFoundError('Produto não encontrado');
    }

    return produto;
  }

  update(id: number, data: UpdateProdutoDTO): Produto {
    const produto = produtoRepository.findById(id);

    if (!produto) {
      throw new NotFoundError('Produto não encontrado');
    }

    // Validar se há pelo menos um campo para atualizar
    if (Object.keys(data).length === 0) {
      throw new BadRequestError('Nenhum campo para atualizar');
    }

    // Validações dos campos fornecidos
    if (data.nome !== undefined && data.nome.trim() === '') {
      throw new BadRequestError('Nome não pode ser vazio');
    }

    if (data.descricao !== undefined && data.descricao.trim() === '') {
      throw new BadRequestError('Descrição não pode ser vazia');
    }

    if (data.categoria !== undefined && data.categoria.trim() === '') {
      throw new BadRequestError('Categoria não pode ser vazia');
    }

    if (data.preco !== undefined) {
      if (data.preco <= 0) {
        throw new BadRequestError('Preço deve ser maior que zero');
      }
      if (!hasMaxTwoDecimals(data.preco)) {
        throw new BadRequestError('Preço deve ter no máximo 2 casas decimais');
      }
    }

    if (data.quantidadeEstoque !== undefined && !isPositiveInteger(data.quantidadeEstoque)) {
      throw new BadRequestError('Quantidade em estoque deve ser um inteiro não negativo');
    }

    if (data.estoqueMinimo !== undefined && !isPositiveInteger(data.estoqueMinimo)) {
      throw new BadRequestError('Estoque mínimo deve ser um inteiro não negativo');
    }

    const updates: Partial<Produto> = {};

    if (data.nome !== undefined) updates.nome = data.nome.trim();
    if (data.descricao !== undefined) updates.descricao = data.descricao.trim();
    if (data.categoria !== undefined) updates.categoria = data.categoria.trim();
    if (data.preco !== undefined) updates.preco = data.preco;
    if (data.quantidadeEstoque !== undefined) updates.quantidadeEstoque = data.quantidadeEstoque;
    if (data.estoqueMinimo !== undefined) updates.estoqueMinimo = data.estoqueMinimo;
    if (data.ativo !== undefined) updates.ativo = data.ativo;

    const updated = produtoRepository.update(id, updates);

    if (!updated) {
      throw new NotFoundError('Produto não encontrado');
    }

    return updated;
  }

  delete(id: number): void {
    const produto = produtoRepository.findById(id);

    if (!produto) {
      throw new NotFoundError('Produto não encontrado');
    }

    // Verificar se há pedidos não cancelados com este produto
    const pedidosAtivos = pedidoRepository.findPedidosComProduto(id);

    if (pedidosAtivos.length > 0) {
      throw new ConflictError('Não é possível deletar produto presente em pedidos não cancelados');
    }

    produtoRepository.delete(id);
  }
}

export default new ProdutoService();
