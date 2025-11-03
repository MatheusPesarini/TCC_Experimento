
import { EmprestimoRepository } from '../repositories/EmprestimoRepository';
import { LivroRepository } from '../repositories/LivroRepository';
import { Emprestimo, CreateEmprestimoDTO } from '../types';
import { ValidationError, NotFoundError, ConflictError } from '../types/errors';

export class EmprestimoService {
  constructor(
    private emprestimoRepository: EmprestimoRepository,
    private livroRepository: LivroRepository
  ) { }

  private validateEmail(email: string): boolean {
    // RFC 5322 simplified regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString() === dateString;
  }

  create(data: CreateEmprestimoDTO): Emprestimo {
    // Validar campos obrigatórios
    if (!data.livroId || !Number.isInteger(data.livroId) || data.livroId < 1) {
      throw new ValidationError('Campo livroId é obrigatório e deve ser um número inteiro válido');
    }

    if (!data.nomeUsuario || data.nomeUsuario.trim().length === 0) {
      throw new ValidationError('Campo nomeUsuario é obrigatório');
    }

    if (!data.emailUsuario || data.emailUsuario.trim().length === 0) {
      throw new ValidationError('Campo emailUsuario é obrigatório');
    }

    if (!this.validateEmail(data.emailUsuario)) {
      throw new ValidationError('Email inválido');
    }

    if (!data.dataEmprestimo || data.dataEmprestimo.trim().length === 0) {
      throw new ValidationError('Campo dataEmprestimo é obrigatório');
    }

    if (!this.validateISODate(data.dataEmprestimo)) {
      throw new ValidationError('dataEmprestimo deve estar no formato ISO 8601');
    }

    // Verificar se livro existe
    const livro = this.livroRepository.findById(data.livroId);
    if (!livro) {
      throw new NotFoundError('Livro não encontrado');
    }

    // Verificar se há exemplares disponíveis
    if (livro.quantidadeDisponivel <= 0) {
      throw new ConflictError('Não há exemplares disponíveis para empréstimo');
    }

    // Decrementar quantidade disponível
    const decrementado = this.livroRepository.decrementarDisponivel(data.livroId);
    if (!decrementado) {
      throw new ConflictError('Erro ao decrementar quantidade disponível');
    }

    // Criar empréstimo
    return this.emprestimoRepository.create(data);
  }

  findAll(): Emprestimo[] {
    return this.emprestimoRepository.findAll();
  }

  findById(id: number): Emprestimo {
    const emprestimo = this.emprestimoRepository.findById(id);
    if (!emprestimo) {
      throw new NotFoundError('Empréstimo não encontrado');
    }
    return emprestimo;
  }

  devolver(id: number): Emprestimo {
    // Verificar se empréstimo existe
    const emprestimo = this.emprestimoRepository.findById(id);
    if (!emprestimo) {
      throw new NotFoundError('Empréstimo não encontrado');
    }

    // Verificar se já foi devolvido
    if (emprestimo.status === 'devolvido') {
      throw new ConflictError('Empréstimo já foi devolvido');
    }

    // Incrementar quantidade disponível do livro
    const incrementado = this.livroRepository.incrementarDisponivel(emprestimo.livroId);
    if (!incrementado) {
      throw new ConflictError('Erro ao incrementar quantidade disponível');
    }

    // Marcar como devolvido
    const emprestimoDevolvido = this.emprestimoRepository.devolver(id);
    if (!emprestimoDevolvido) {
      throw new NotFoundError('Empréstimo não encontrado');
    }

    return emprestimoDevolvido;
  }

  delete(id: number): void {
    // Verificar se empréstimo existe
    const emprestimo = this.emprestimoRepository.findById(id);
    if (!emprestimo) {
      throw new NotFoundError('Empréstimo não encontrado');
    }

    // Verificar se já foi devolvido (não pode cancelar)
    if (emprestimo.status === 'devolvido') {
      throw new ConflictError('Não é possível cancelar empréstimo já devolvido');
    }

    // Incrementar quantidade disponível do livro
    const incrementado = this.livroRepository.incrementarDisponivel(emprestimo.livroId);
    if (!incrementado) {
      throw new ConflictError('Erro ao incrementar quantidade disponível');
    }

    // Deletar empréstimo
    this.emprestimoRepository.delete(id);
  }
}
