
import { EmprestimoRepository } from '../repositories/emprestimo-repository.js';
import { LivroRepository } from '../repositories/livro-repository.js';
import { CriarEmprestimoDTO, Emprestimo, EmprestimoComLivro } from '../types/index.js';
import { EmprestimoValidator } from '../validators/emprestimo-validator.js';

export class EmprestimoService {
  constructor(
    private emprestimoRepository: EmprestimoRepository,
    private livroRepository: LivroRepository
  ) { }

  criar(dto: CriarEmprestimoDTO): { sucesso: boolean; emprestimo?: Emprestimo; erro?: string; statusCode?: number } {
    const validacao = EmprestimoValidator.validarCriarEmprestimo(dto);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro, statusCode: 400 };
    }

    const livro = this.livroRepository.buscarPorId(dto.livroId);
    if (!livro) {
      return { sucesso: false, erro: 'Livro não encontrado', statusCode: 404 };
    }

    if (livro.quantidadeDisponivel <= 0) {
      return {
        sucesso: false,
        erro: 'Não há exemplares disponíveis deste livro',
        statusCode: 409
      };
    }

    const novoEmprestimo = this.emprestimoRepository.criar(dto);
    this.livroRepository.atualizarDisponibilidade(dto.livroId, livro.quantidadeDisponivel - 1);

    return { sucesso: true, emprestimo: novoEmprestimo };
  }

  buscarPorId(id: number): { sucesso: boolean; emprestimo?: EmprestimoComLivro; erro?: string; statusCode?: number } {
    const emprestimo = this.emprestimoRepository.buscarPorId(id);
    if (!emprestimo) {
      return { sucesso: false, erro: 'Empréstimo não encontrado', statusCode: 404 };
    }

    const livro = this.livroRepository.buscarPorId(emprestimo.livroId);
    if (!livro) {
      return { sucesso: false, erro: 'Livro associado não encontrado', statusCode: 404 };
    }

    const emprestimoComLivro: EmprestimoComLivro = {
      ...emprestimo,
      livro: {
        titulo: livro.titulo,
        autor: livro.autor,
      },
    };

    return { sucesso: true, emprestimo: emprestimoComLivro };
  }

  listarTodos(): EmprestimoComLivro[] {
    const emprestimos = this.emprestimoRepository.listarTodos();

    return emprestimos.map(emprestimo => {
      const livro = this.livroRepository.buscarPorId(emprestimo.livroId);
      return {
        ...emprestimo,
        livro: {
          titulo: livro?.titulo || '',
          autor: livro?.autor || '',
        },
      };
    });
  }

  devolver(id: number): { sucesso: boolean; emprestimo?: Emprestimo; erro?: string; statusCode?: number } {
    const emprestimo = this.emprestimoRepository.buscarPorId(id);
    if (!emprestimo) {
      return { sucesso: false, erro: 'Empréstimo não encontrado', statusCode: 404 };
    }

    if (emprestimo.status === 'devolvido') {
      return {
        sucesso: false,
        erro: 'Empréstimo já foi devolvido',
        statusCode: 409
      };
    }

    const livro = this.livroRepository.buscarPorId(emprestimo.livroId);
    if (livro) {
      this.livroRepository.atualizarDisponibilidade(emprestimo.livroId, livro.quantidadeDisponivel + 1);
    }

    const emprestimoAtualizado = this.emprestimoRepository.marcarComoDevolvido(id);
    return { sucesso: true, emprestimo: emprestimoAtualizado };
  }

  deletar(id: number): { sucesso: boolean; erro?: string; statusCode?: number } {
    const emprestimo = this.emprestimoRepository.buscarPorId(id);
    if (!emprestimo) {
      return { sucesso: false, erro: 'Empréstimo não encontrado', statusCode: 404 };
    }

    if (emprestimo.status === 'devolvido') {
      return {
        sucesso: false,
        erro: 'Não é possível cancelar empréstimo já devolvido',
        statusCode: 409
      };
    }

    const livro = this.livroRepository.buscarPorId(emprestimo.livroId);
    if (livro) {
      this.livroRepository.atualizarDisponibilidade(emprestimo.livroId, livro.quantidadeDisponivel + 1);
    }

    this.emprestimoRepository.deletar(id);
    return { sucesso: true };
  }
}
