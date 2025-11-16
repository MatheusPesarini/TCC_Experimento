
import { Emprestimo, CriarEmprestimoDTO } from '../types/index.js';
import { DateUtils } from '../utils/date-utils.js';

export class EmprestimoRepository {
  private emprestimos: Emprestimo[] = [];
  private proximoId = 1;

  criar(dto: CriarEmprestimoDTO): Emprestimo {
    const novoEmprestimo: Emprestimo = {
      id: this.proximoId++,
      livroId: dto.livroId,
      nomeUsuario: dto.nomeUsuario,
      emailUsuario: dto.emailUsuario,
      dataEmprestimo: dto.dataEmprestimo,
      dataPrevistaDevolucao: DateUtils.addDays(dto.dataEmprestimo, 14),
      status: 'ativo',
    };

    this.emprestimos.push(novoEmprestimo);
    return novoEmprestimo;
  }

  buscarPorId(id: number): Emprestimo | undefined {
    return this.emprestimos.find(emp => emp.id === id);
  }

  listarTodos(): Emprestimo[] {
    return [...this.emprestimos];
  }

  listarPorLivroId(livroId: number): Emprestimo[] {
    return this.emprestimos.filter(emp => emp.livroId === livroId);
  }

  contarEmprestimosAtivos(livroId: number): number {
    return this.emprestimos.filter(
      emp => emp.livroId === livroId && emp.status === 'ativo'
    ).length;
  }

  marcarComoDevolvido(id: number): Emprestimo | undefined {
    const emprestimo = this.buscarPorId(id);
    if (!emprestimo) {
      return undefined;
    }

    emprestimo.status = 'devolvido';
    emprestimo.dataDevolvido = DateUtils.getCurrentISODate();
    return emprestimo;
  }

  deletar(id: number): boolean {
    const index = this.emprestimos.findIndex(emp => emp.id === id);
    if (index === -1) {
      return false;
    }

    this.emprestimos.splice(index, 1);
    return true;
  }
}
