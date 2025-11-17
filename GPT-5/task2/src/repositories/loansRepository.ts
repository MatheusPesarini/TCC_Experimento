import { Emprestimo } from '../models.js';

let loans: Emprestimo[] = [];
let nextId = 1;

export const loansRepository = {
  create(data: Omit<Emprestimo, 'id' | 'dataPrevistaDevolucao' | 'status' | 'dataDevolvido'>): Emprestimo {
    const dataEmp = new Date(data.dataEmprestimo);
    const dataPrev = new Date(dataEmp.getTime() + 14 * 24 * 60 * 60 * 1000);
    const emprestimo: Emprestimo = {
      id: nextId++,
      livroId: data.livroId,
      nomeUsuario: data.nomeUsuario,
      emailUsuario: data.emailUsuario,
      dataEmprestimo: dataEmp.toISOString(),
      dataPrevistaDevolucao: dataPrev.toISOString(),
      status: 'ativo'
    };
    loans.push(emprestimo);
    return emprestimo;
  },
  findAll(): Emprestimo[] {
    return loans.slice();
  },
  findById(id: number): Emprestimo | undefined {
    return loans.find(l => l.id === id);
  },
  update(e: Emprestimo): Emprestimo {
    const idx = loans.findIndex(l => l.id === e.id);
    if (idx >= 0) loans[idx] = e;
    return e;
  },
  delete(id: number): void {
    loans = loans.filter(l => l.id !== id);
  },
  countActiveLoansByBook(livroId: number): number {
    return loans.filter(l => l.livroId === livroId && l.status === 'ativo').length;
  },
  clearAll(): void {
    loans = [];
    nextId = 1;
  }
};
