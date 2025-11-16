
import { LivroRepository } from '../repositories/livro-repository.js';
import { EmprestimoRepository } from '../repositories/emprestimo-repository.js';
import { CriarLivroDTO, AtualizarLivroDTO, Livro } from '../types/index.js';
import { LivroValidator } from '../validators/livro-validator.js';

export class LivroService {
  constructor(
    private livroRepository: LivroRepository,
    private emprestimoRepository: EmprestimoRepository
  ) { }

  criar(dto: CriarLivroDTO): { sucesso: boolean; livro?: Livro; erro?: string; statusCode?: number } {
    const validacao = LivroValidator.validarCriarLivro(dto);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro, statusCode: 400 };
    }

    const livroExistente = this.livroRepository.buscarPorISBN(dto.isbn);
    if (livroExistente) {
      return { sucesso: false, erro: 'ISBN já cadastrado', statusCode: 409 };
    }

    const novoLivro = this.livroRepository.criar(dto);
    return { sucesso: true, livro: novoLivro };
  }

  buscarPorId(id: number): { sucesso: boolean; livro?: Livro; erro?: string; statusCode?: number } {
    const livro = this.livroRepository.buscarPorId(id);
    if (!livro) {
      return { sucesso: false, erro: 'Livro não encontrado', statusCode: 404 };
    }

    return { sucesso: true, livro };
  }

  listarTodos(): Livro[] {
    return this.livroRepository.listarTodos();
  }

  atualizar(id: number, dto: AtualizarLivroDTO): { sucesso: boolean; livro?: Livro; erro?: string; statusCode?: number } {
    const validacao = LivroValidator.validarAtualizarLivro(dto);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro, statusCode: 400 };
    }

    const livroAtual = this.livroRepository.buscarPorId(id);
    if (!livroAtual) {
      return { sucesso: false, erro: 'Livro não encontrado', statusCode: 404 };
    }

    if (dto.isbn && dto.isbn !== livroAtual.isbn) {
      const livroComISBN = this.livroRepository.buscarPorISBN(dto.isbn);
      if (livroComISBN) {
        return { sucesso: false, erro: 'ISBN já cadastrado', statusCode: 409 };
      }
    }

    if (dto.quantidadeTotal !== undefined) {
      const emprestados = livroAtual.quantidadeTotal - livroAtual.quantidadeDisponivel;
      if (dto.quantidadeTotal < emprestados) {
        return {
          sucesso: false,
          erro: 'Quantidade total não pode ser menor que exemplares emprestados',
          statusCode: 400
        };
      }
    }

    const livroAtualizado = this.livroRepository.atualizar(id, dto);
    return { sucesso: true, livro: livroAtualizado };
  }

  deletar(id: number): { sucesso: boolean; erro?: string; statusCode?: number } {
    const livro = this.livroRepository.buscarPorId(id);
    if (!livro) {
      return { sucesso: false, erro: 'Livro não encontrado', statusCode: 404 };
    }

    const emprestimosAtivos = this.emprestimoRepository.contarEmprestimosAtivos(id);
    if (emprestimosAtivos > 0) {
      return {
        sucesso: false,
        erro: 'Não é possível deletar livro com empréstimos ativos',
        statusCode: 409
      };
    }

    this.livroRepository.deletar(id);
    return { sucesso: true };
  }
}
