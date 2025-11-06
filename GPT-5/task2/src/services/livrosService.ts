import { Livro } from '../models';
import { DB } from '../storage';
import { isValidISBN13Hyphenated, isNonEmptyString, isPositiveInt } from '../utils/validators';

export type CreateLivroInput = {
  titulo: unknown;
  autor: unknown;
  isbn: unknown;
  quantidadeTotal: unknown;
};

export type UpdateLivroInput = Partial<{
  titulo: unknown;
  autor: unknown;
  isbn: unknown;
  quantidadeTotal: unknown;
}>;

function findLivroById(id: number): Livro | undefined {
  return DB.livros.find((l: Livro) => l.id === id);
}

function isIsbnDuplicated(isbn: string, ignoreId?: number): boolean {
  return DB.livros.some((l: Livro) => l.isbn === isbn && l.id !== ignoreId);
}

function calcBorrowedCount(livro: Livro): number {
  return livro.quantidadeTotal - livro.quantidadeDisponivel;
}

export const LivrosService = {
  list(): Livro[] {
    return DB.livros;
  },

  getById(id: number): Livro | undefined {
    return findLivroById(id);
  },

  create(input: CreateLivroInput): { ok: true; value: Livro } | { ok: false; code: number; message: string } {
    // validações
    if (!isNonEmptyString(input.titulo)) return { ok: false, code: 400, message: 'titulo inválido' };
    if (!isNonEmptyString(input.autor)) return { ok: false, code: 400, message: 'autor inválido' };
    if (!isValidISBN13Hyphenated(input.isbn)) return { ok: false, code: 400, message: 'isbn inválido' };

    const qtdTotal = typeof input.quantidadeTotal === 'number' ? input.quantidadeTotal : NaN;
    if (!isPositiveInt(qtdTotal)) return { ok: false, code: 400, message: 'quantidadeTotal inválida' };

    if (isIsbnDuplicated(input.isbn as string)) return { ok: false, code: 409, message: 'isbn duplicado' };

    const now = new Date().toISOString();
    const livro: Livro = {
      id: DB.genLivroId(),
      titulo: input.titulo as string,
      autor: input.autor as string,
      isbn: input.isbn as string,
      quantidadeTotal: qtdTotal,
      quantidadeDisponivel: qtdTotal, // inicia igual
      dataDeCadastro: now,
    };
    DB.livros.push(livro);
    return { ok: true, value: livro };
  },

  update(id: number, input: UpdateLivroInput): { ok: true; value: Livro } | { ok: false; code: number; message: string } {
    const livro = findLivroById(id);
    if (!livro) return { ok: false, code: 404, message: 'livro não encontrado' };

    if (!input || Object.keys(input).length === 0) return { ok: false, code: 400, message: 'body vazio' };

    // clone
    const updated: Livro = { ...livro };

    if (input.titulo !== undefined) {
      if (!isNonEmptyString(input.titulo)) return { ok: false, code: 400, message: 'titulo inválido' };
      updated.titulo = input.titulo as string;
    }

    if (input.autor !== undefined) {
      if (!isNonEmptyString(input.autor)) return { ok: false, code: 400, message: 'autor inválido' };
      updated.autor = input.autor as string;
    }

    if (input.isbn !== undefined) {
      if (!isValidISBN13Hyphenated(input.isbn)) return { ok: false, code: 400, message: 'isbn inválido' };
      const newIsbn = input.isbn as string;
      if (isIsbnDuplicated(newIsbn, id)) return { ok: false, code: 409, message: 'isbn duplicado' };
      updated.isbn = newIsbn;
    }

    if (input.quantidadeTotal !== undefined) {
      const newTotal = typeof input.quantidadeTotal === 'number' ? input.quantidadeTotal : NaN;
      if (!isPositiveInt(newTotal)) return { ok: false, code: 400, message: 'quantidadeTotal inválida' };

      const borrowed = calcBorrowedCount(livro); // com base no estado atual
      if (newTotal < borrowed) {
        return { ok: false, code: 400, message: 'quantidadeTotal menor que exemplares emprestados' };
      }
      // ajustar disponibilidade mantendo emprestados
      updated.quantidadeTotal = newTotal;
      updated.quantidadeDisponivel = newTotal - borrowed;
    }

    // persistir
    Object.assign(livro, updated);
    return { ok: true, value: livro };
  },

  delete(id: number): { ok: true } | { ok: false; code: number; message: string } {
    const idx = DB.livros.findIndex((l: Livro) => l.id === id);
    if (idx === -1) return { ok: false, code: 404, message: 'livro não encontrado' };

    // Verificar empréstimos ativos
    const hasActiveLoans = DB.emprestimos.some((e) => e.livroId === id && e.status === 'ativo');
    if (hasActiveLoans) return { ok: false, code: 409, message: 'livro possui empréstimos ativos' };

    DB.livros.splice(idx, 1);
    return { ok: true };
  },
};
