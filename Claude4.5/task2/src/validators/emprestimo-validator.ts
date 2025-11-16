
import { CriarEmprestimoDTO } from '../types/index.js';
import { DateUtils } from '../utils/date-utils.js';

export class EmprestimoValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static validarEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  static validarCriarEmprestimo(data: CriarEmprestimoDTO): { valido: boolean; erro?: string } {
    if (typeof data.livroId !== 'number' || !Number.isInteger(data.livroId)) {
      return { valido: false, erro: 'livroId deve ser um número inteiro válido' };
    }

    if (!data.nomeUsuario || typeof data.nomeUsuario !== 'string' || data.nomeUsuario.trim() === '') {
      return { valido: false, erro: 'Nome do usuário é obrigatório e deve ser uma string não vazia' };
    }

    if (!data.emailUsuario || typeof data.emailUsuario !== 'string') {
      return { valido: false, erro: 'Email do usuário é obrigatório' };
    }

    if (!this.validarEmail(data.emailUsuario)) {
      return { valido: false, erro: 'Email inválido' };
    }

    if (!data.dataEmprestimo || typeof data.dataEmprestimo !== 'string') {
      return { valido: false, erro: 'Data de empréstimo é obrigatória' };
    }

    if (!DateUtils.isValidISODate(data.dataEmprestimo)) {
      return { valido: false, erro: 'Data de empréstimo inválida. Use formato ISO 8601' };
    }

    return { valido: true };
  }

  static validarId(id: string): { valido: boolean; idNumerico?: number; erro?: string } {
    const idNumerico = Number(id);
    if (isNaN(idNumerico) || !Number.isInteger(idNumerico)) {
      return { valido: false, erro: 'ID inválido' };
    }
    return { valido: true, idNumerico };
  }
}
