import { Emprestimo, Livro } from '../models.js';
import { booksRepository } from '../repositories/booksRepository.js';
import { loansRepository } from '../repositories/loansRepository.js';
import { isNonEmptyString, isPositiveInt, isValidEmail, isValidIsoDate } from '../validators.js';

interface CreateEmprestimoDTO {
  livroId: unknown;
  nomeUsuario: unknown;
  emailUsuario: unknown;
  dataEmprestimo: unknown;
}

const buildError = (status: number, message: string) => ({ status, message });

const attachBasicBookInfo = (emprestimo: Emprestimo, livro: Livro) => ({
  ...emprestimo,
  livro: {
    id: livro.id,
    titulo: livro.titulo,
    autor: livro.autor
  }
});

const attachFullBookInfo = (emprestimo: Emprestimo, livro: Livro) => ({
  ...emprestimo,
  livro
});

export const loansService = {
  create(data: CreateEmprestimoDTO): Emprestimo {
    if (!isPositiveInt(data.livroId) || !isNonEmptyString(data.nomeUsuario) || !isValidEmail(data.emailUsuario) || !isValidIsoDate(data.dataEmprestimo)) {
      throw buildError(400, 'Dados inválidos para criação de empréstimo');
    }
    const livro = booksRepository.findById(data.livroId as number);
    if (!livro) throw buildError(404, 'Livro não encontrado');
    if (livro.quantidadeDisponivel <= 0) throw buildError(409, 'Sem exemplares disponíveis');

    // Atualizar estoque (decremento)
    livro.quantidadeDisponivel -= 1;
    if (livro.quantidadeDisponivel < 0) throw buildError(409, 'Estoque negativo');
    booksRepository.update(livro);

    const emprestimo = loansRepository.create({
      livroId: livro.id,
      nomeUsuario: data.nomeUsuario as string,
      emailUsuario: data.emailUsuario as string,
      dataEmprestimo: data.dataEmprestimo as string
    });
    return emprestimo;
  },
  list(): Array<Emprestimo & { livro: { id: number; titulo: string; autor: string } }> {
    return loansRepository.findAll().map(l => {
      const livro = booksRepository.findById(l.livroId);
      if (!livro) return { ...l, livro: { id: l.livroId, titulo: '', autor: '' } }; // deveria não acontecer
      return attachBasicBookInfo(l, livro);
    });
  },
  get(idRaw: string): Emprestimo & { livro: Livro } {
    const id = parseInt(idRaw, 10);
    if (isNaN(id) || !/^\d+$/.test(idRaw)) throw buildError(400, 'ID inválido');
    const emprestimo = loansRepository.findById(id);
    if (!emprestimo) throw buildError(404, 'Empréstimo não encontrado');
    const livro = booksRepository.findById(emprestimo.livroId);
    if (!livro) throw buildError(404, 'Livro associado não encontrado');
    return attachFullBookInfo(emprestimo, livro);
  },
  devolver(idRaw: string): Emprestimo {
    const id = parseInt(idRaw, 10);
    if (isNaN(id) || !/^\d+$/.test(idRaw)) throw buildError(400, 'ID inválido');
    const emprestimo = loansRepository.findById(id);
    if (!emprestimo) throw buildError(404, 'Empréstimo não encontrado');
    if (emprestimo.status === 'devolvido') throw buildError(409, 'Empréstimo já devolvido');
    const livro = booksRepository.findById(emprestimo.livroId);
    if (!livro) throw buildError(404, 'Livro associado não encontrado');

    emprestimo.status = 'devolvido';
    emprestimo.dataDevolvido = new Date().toISOString();
    loansRepository.update(emprestimo);

    // Incrementar estoque
    livro.quantidadeDisponivel += 1;
    if (livro.quantidadeDisponivel > livro.quantidadeTotal) livro.quantidadeDisponivel = livro.quantidadeTotal; // proteção
    booksRepository.update(livro);

    return emprestimo;
  },
  cancelar(idRaw: string): void {
    const id = parseInt(idRaw, 10);
    if (isNaN(id) || !/^\d+$/.test(idRaw)) throw buildError(400, 'ID inválido');
    const emprestimo = loansRepository.findById(id);
    if (!emprestimo) throw buildError(404, 'Empréstimo não encontrado');
    if (emprestimo.status === 'devolvido') throw buildError(409, 'Não pode cancelar empréstimo devolvido');
    const livro = booksRepository.findById(emprestimo.livroId);
    if (!livro) throw buildError(404, 'Livro associado não encontrado');

    // Restaurar disponibilidade
    livro.quantidadeDisponivel += 1;
    if (livro.quantidadeDisponivel > livro.quantidadeTotal) livro.quantidadeDisponivel = livro.quantidadeTotal;
    booksRepository.update(livro);
    loansRepository.delete(emprestimo.id);
  }
};
