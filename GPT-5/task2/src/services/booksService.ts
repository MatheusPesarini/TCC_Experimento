import { Livro } from '../models.js';
import { booksRepository } from '../repositories/booksRepository.js';
import { loansRepository } from '../repositories/loansRepository.js';
import { isNonEmptyString, isPositiveInt, isValidIsbn } from '../validators.js';

interface CreateLivroDTO {
  titulo: unknown;
  autor: unknown;
  isbn: unknown;
  quantidadeTotal: unknown;
}

interface UpdateLivroDTO {
  titulo?: unknown;
  autor?: unknown;
  isbn?: unknown;
  quantidadeTotal?: unknown;
}

const buildError = (status: number, message: string) => ({ status, message });

export const booksService = {
  create(data: CreateLivroDTO): Livro {
    // Validar campos obrigatórios
    if (!isNonEmptyString(data.titulo) || !isNonEmptyString(data.autor) || !isValidIsbn(data.isbn) || !isPositiveInt(data.quantidadeTotal)) {
      throw buildError(400, 'Dados inválidos para criação de livro');
    }
    // ISBN único
    if (booksRepository.findByIsbn(data.isbn)) {
      throw buildError(409, 'ISBN já cadastrado');
    }
    return booksRepository.create({
      titulo: data.titulo,
      autor: data.autor,
      isbn: data.isbn,
      quantidadeTotal: data.quantidadeTotal
    });
  },
  list(): Livro[] {
    return booksRepository.findAll();
  },
  get(idRaw: string): Livro {
    const id = parseInt(idRaw, 10);
    if (isNaN(id) || !/^\d+$/.test(idRaw)) throw buildError(400, 'ID inválido');
    const livro = booksRepository.findById(id);
    if (!livro) throw buildError(404, 'Livro não encontrado');
    return livro;
  },
  update(idRaw: string, patch: UpdateLivroDTO): Livro {
    const id = parseInt(idRaw, 10);
    if (isNaN(id) || !/^\d+$/.test(idRaw)) throw buildError(400, 'ID inválido');
    if (!patch || Object.keys(patch).length === 0) throw buildError(400, 'Body vazio');
    const livro = booksRepository.findById(id);
    if (!livro) throw buildError(404, 'Livro não encontrado');

    // Atualizações parciais
    if (patch.titulo !== undefined) {
      if (!isNonEmptyString(patch.titulo)) throw buildError(400, 'Título inválido');
      livro.titulo = patch.titulo;
    }
    if (patch.autor !== undefined) {
      if (!isNonEmptyString(patch.autor)) throw buildError(400, 'Autor inválido');
      livro.autor = patch.autor;
    }
    if (patch.isbn !== undefined) {
      if (!isValidIsbn(patch.isbn)) throw buildError(400, 'ISBN inválido');
      const existente = booksRepository.findByIsbn(patch.isbn as string);
      if (existente && existente.id !== livro.id) throw buildError(409, 'ISBN duplicado');
      livro.isbn = patch.isbn as string;
    }
    if (patch.quantidadeTotal !== undefined) {
      if (typeof patch.quantidadeTotal !== 'number' || !isPositiveInt(patch.quantidadeTotal)) throw buildError(400, 'QuantidadeTotal inválida');
      const emprestados = livro.quantidadeTotal - livro.quantidadeDisponivel; // exemplares atualmente emprestados
      const novoTotal = patch.quantidadeTotal as number;
      if (novoTotal < emprestados) throw buildError(400, 'Novo total menor que exemplares emprestados');
      livro.quantidadeTotal = novoTotal;
      livro.quantidadeDisponivel = novoTotal - emprestados;
    }

    booksRepository.update(livro);
    return livro;
  },
  delete(idRaw: string): void {
    const id = parseInt(idRaw, 10);
    if (isNaN(id) || !/^\d+$/.test(idRaw)) throw buildError(400, 'ID inválido');
    const livro = booksRepository.findById(id);
    if (!livro) throw buildError(404, 'Livro não encontrado');
    const ativos = loansRepository.countActiveLoansByBook(livro.id);
    if (ativos > 0) throw buildError(409, 'Livro possui empréstimos ativos');
    booksRepository.delete(livro.id);
  }
};
