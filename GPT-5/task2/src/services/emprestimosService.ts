import { Emprestimo, EmprestimoComLivroBasico, EmprestimoComLivroCompleto, Livro } from '../models';
import { DB } from '../storage';
import { isNonEmptyString, isPositiveInt, isValidEmail, isValidISODate } from '../utils/validators';

export type CreateEmprestimoInput = {
  livroId: unknown;
  nomeUsuario: unknown;
  emailUsuario: unknown;
  dataEmprestimo: unknown;
};

function findLivroById(id: number): Livro | undefined {
  return DB.livros.find((l: Livro) => l.id === id);
}

function findEmprestimoById(id: number): Emprestimo | undefined {
  return DB.emprestimos.find((e: Emprestimo) => e.id === id);
}

function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(dateISO);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export const EmprestimosService = {
  list(): EmprestimoComLivroBasico[] {
    return DB.emprestimos.map((e: Emprestimo) => {
      const livro = findLivroById(e.livroId);
      return {
        ...e,
        livro: livro ? { titulo: livro.titulo, autor: livro.autor } : undefined,
      };
    });
  },

  getById(id: number): EmprestimoComLivroCompleto | undefined {
    const e = findEmprestimoById(id);
    if (!e) return undefined;
    const livro = findLivroById(e.livroId);
    return { ...e, livro };
  },

  create(input: CreateEmprestimoInput): { ok: true; value: Emprestimo } | { ok: false; code: number; message: string } {
    const livroId = typeof input.livroId === 'number' ? input.livroId : NaN;
    if (!isPositiveInt(livroId)) return { ok: false, code: 400, message: 'livroId inválido' };
    if (!isNonEmptyString(input.nomeUsuario)) return { ok: false, code: 400, message: 'nomeUsuario inválido' };
    if (!isValidEmail(input.emailUsuario)) return { ok: false, code: 400, message: 'emailUsuario inválido' };
    if (!isValidISODate(input.dataEmprestimo)) return { ok: false, code: 400, message: 'dataEmprestimo inválido' };

    const livro = findLivroById(livroId);
    if (!livro) return { ok: false, code: 404, message: 'livro não encontrado' };

    if (livro.quantidadeDisponivel <= 0) return { ok: false, code: 409, message: 'sem exemplares disponíveis' };

    // Decrementar disponibilidade
    livro.quantidadeDisponivel -= 1;
    if (livro.quantidadeDisponivel < 0) livro.quantidadeDisponivel = 0; // proteção extra

    const dataEmp = input.dataEmprestimo as string;
    const emprestimo: Emprestimo = {
      id: DB.genEmprestimoId(),
      livroId,
      nomeUsuario: input.nomeUsuario as string,
      emailUsuario: input.emailUsuario as string,
      dataEmprestimo: dataEmp,
      dataPrevistaDevolucao: addDaysISO(dataEmp, 14),
      status: 'ativo',
    };
    DB.emprestimos.push(emprestimo);
    return { ok: true, value: emprestimo };
  },

  devolver(id: number): { ok: true; value: Emprestimo } | { ok: false; code: number; message: string } {
    const e = findEmprestimoById(id);
    if (!e) return { ok: false, code: 404, message: 'empréstimo não encontrado' };

    if (e.status === 'devolvido') return { ok: false, code: 409, message: 'empréstimo já devolvido' };

    const livro = findLivroById(e.livroId);
    if (!livro) return { ok: false, code: 404, message: 'livro associado não encontrado' };

    e.status = 'devolvido';
    e.dataDevolvido = new Date().toISOString();

    // Incrementar disponibilidade, mas nunca exceder quantidadeTotal
    livro.quantidadeDisponivel = Math.min(livro.quantidadeDisponivel + 1, livro.quantidadeTotal);

    return { ok: true, value: e };
  },

  cancelar(id: number): { ok: true } | { ok: false; code: number; message: string } {
    const idx = DB.emprestimos.findIndex((e: Emprestimo) => e.id === id);
    if (idx === -1) return { ok: false, code: 404, message: 'empréstimo não encontrado' };

    const e = DB.emprestimos[idx];
    if (e.status === 'devolvido') return { ok: false, code: 409, message: 'empréstimo já devolvido' };

    const livro = findLivroById(e.livroId);
    if (livro) {
      livro.quantidadeDisponivel = Math.min(livro.quantidadeDisponivel + 1, livro.quantidadeTotal);
    }

    DB.emprestimos.splice(idx, 1);
    return { ok: true };
  },
};
