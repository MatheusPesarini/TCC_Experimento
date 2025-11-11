
import { Emprestimo, CreateEmprestimoDTO } from '../types/index.js';

export class EmprestimoRepository {
  private emprestimos: Emprestimo[] = [];
  private nextId: number = 1;

  create(data: CreateEmprestimoDTO): Emprestimo {
    const dataEmprestimo = new Date(data.dataEmprestimo);
    const dataPrevistaDevolucao = new Date(dataEmprestimo);
    dataPrevistaDevolucao.setDate(dataPrevistaDevolucao.getDate() + 14);

    const emprestimo: Emprestimo = {
      id: this.nextId++,
      livroId: data.livroId,
      nomeUsuario: data.nomeUsuario,
      emailUsuario: data.emailUsuario,
      dataEmprestimo: data.dataEmprestimo,
      dataPrevistaDevolucao: dataPrevistaDevolucao.toISOString(),
      status: 'ativo'
    };

    this.emprestimos.push(emprestimo);
    return emprestimo;
  }

  findAll(): Emprestimo[] {
    return [...this.emprestimos];
  }

  findById(id: number): Emprestimo | undefined {
    return this.emprestimos.find(emp => emp.id === id);
  }

  findByLivroId(livroId: number): Emprestimo[] {
    return this.emprestimos.filter(emp => emp.livroId === livroId);
  }

  findAtivosbyLivroId(livroId: number): Emprestimo[] {
    return this.emprestimos.filter(
      emp => emp.livroId === livroId && emp.status === 'ativo'
    );
  }

  devolver(id: number): Emprestimo | undefined {
    const emprestimo = this.findById(id);
    if (!emprestimo) {
      return undefined;
    }

    emprestimo.status = 'devolvido';
    emprestimo.dataDevolvido = new Date().toISOString();
    return emprestimo;
  }

  delete(id: number): boolean {
    const index = this.emprestimos.findIndex(emp => emp.id === id);
    if (index === -1) {
      return false;
    }

    this.emprestimos.splice(index, 1);
    return true;
  }
}
