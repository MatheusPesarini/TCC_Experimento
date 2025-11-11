
import { LivroRepository } from '../repositories/LivroRepository.js';
import { EmprestimoRepository } from '../repositories/EmprestimoRepository.js';
import { Livro, CreateLivroDTO, UpdateLivroDTO } from '../types/index.js';
import { ValidationError, NotFoundError, ConflictError } from '../types/errors.js';

export class LivroService {
  constructor(
    private livroRepository: LivroRepository,
    private emprestimoRepository: EmprestimoRepository
  ) { }

  private validateISBN(isbn: string): boolean {
    // Formato: XXX-X-XX-XXXXXX-X
    const isbnRegex = /^\d{3}-\d{1}-\d{2}-\d{6}-\d{1}$/;
    return isbnRegex.test(isbn);
  }

  create(data: CreateLivroDTO): Livro {
    // Validar campos obrigatórios
    if (!data.titulo || data.titulo.trim().length === 0) {
      throw new ValidationError('Campo titulo é obrigatório');
    }

    if (!data.autor || data.autor.trim().length === 0) {
      throw new ValidationError('Campo autor é obrigatório');
    }

    if (!data.isbn || data.isbn.trim().length === 0) {
      throw new ValidationError('Campo isbn é obrigatório');
    }

    if (!this.validateISBN(data.isbn)) {
      throw new ValidationError('ISBN inválido. Formato esperado: XXX-X-XX-XXXXXX-X');
    }

    if (!data.quantidadeTotal || data.quantidadeTotal < 1 || !Number.isInteger(data.quantidadeTotal)) {
      throw new ValidationError('Campo quantidadeTotal deve ser um número inteiro >= 1');
    }

    // Verificar ISBN duplicado
    const existingLivro = this.livroRepository.findByIsbn(data.isbn);
    if (existingLivro) {
      throw new ConflictError('ISBN já cadastrado no sistema');
    }

    return this.livroRepository.create(data);
  }

  findAll(): Livro[] {
    return this.livroRepository.findAll();
  }

  findById(id: number): Livro {
    const livro = this.livroRepository.findById(id);
    if (!livro) {
      throw new NotFoundError('Livro não encontrado');
    }
    return livro;
  }

  update(id: number, data: UpdateLivroDTO): Livro {
    // Validar que pelo menos um campo foi fornecido
    if (Object.keys(data).length === 0) {
      throw new ValidationError('Nenhum campo fornecido para atualização');
    }

    // Verificar se livro existe
    const livroExistente = this.livroRepository.findById(id);
    if (!livroExistente) {
      throw new NotFoundError('Livro não encontrado');
    }

    // Validar titulo se fornecido
    if (data.titulo !== undefined) {
      if (!data.titulo || data.titulo.trim().length === 0) {
        throw new ValidationError('Campo titulo não pode ser vazio');
      }
    }

    // Validar autor se fornecido
    if (data.autor !== undefined) {
      if (!data.autor || data.autor.trim().length === 0) {
        throw new ValidationError('Campo autor não pode ser vazio');
      }
    }

    // Validar ISBN se fornecido
    if (data.isbn !== undefined) {
      if (!data.isbn || data.isbn.trim().length === 0) {
        throw new ValidationError('Campo isbn não pode ser vazio');
      }

      if (!this.validateISBN(data.isbn)) {
        throw new ValidationError('ISBN inválido. Formato esperado: XXX-X-XX-XXXXXX-X');
      }

      // Verificar se ISBN já está em uso por outro livro
      const livroComIsbn = this.livroRepository.findByIsbn(data.isbn);
      if (livroComIsbn && livroComIsbn.id !== id) {
        throw new ConflictError('ISBN já cadastrado para outro livro');
      }
    }

    // Validar quantidadeTotal se fornecido
    if (data.quantidadeTotal !== undefined) {
      if (data.quantidadeTotal < 1 || !Number.isInteger(data.quantidadeTotal)) {
        throw new ValidationError('Campo quantidadeTotal deve ser um número inteiro >= 1');
      }

      // Regra de negócio: quantidadeTotal não pode ser menor que exemplares emprestados
      const emprestados = livroExistente.quantidadeTotal - livroExistente.quantidadeDisponivel;
      if (data.quantidadeTotal < emprestados) {
        throw new ValidationError(
          `Quantidade total não pode ser menor que ${emprestados} (exemplares atualmente emprestados)`
        );
      }

      // Atualizar quantidadeDisponivel proporcionalmente
      const novaQuantidadeDisponivel = data.quantidadeTotal - emprestados;
      const updateData = { ...data, quantidadeDisponivel: novaQuantidadeDisponivel };
      const livroAtualizado = this.livroRepository.update(id, updateData);
      if (!livroAtualizado) {
        throw new NotFoundError('Livro não encontrado');
      }
      return livroAtualizado;
    }

    const livroAtualizado = this.livroRepository.update(id, data);
    if (!livroAtualizado) {
      throw new NotFoundError('Livro não encontrado');
    }

    return livroAtualizado;
  }

  delete(id: number): void {
    // Verificar se livro existe
    const livro = this.livroRepository.findById(id);
    if (!livro) {
      throw new NotFoundError('Livro não encontrado');
    }

    // Verificar se há empréstimos ativos
    const emprestimosAtivos = this.emprestimoRepository.findAtivosbyLivroId(id);
    if (emprestimosAtivos.length > 0) {
      throw new ConflictError('Não é possível deletar livro com empréstimos ativos');
    }

    this.livroRepository.delete(id);
  }
}
