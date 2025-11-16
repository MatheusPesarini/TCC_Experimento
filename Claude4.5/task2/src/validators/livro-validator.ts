
import { CriarLivroDTO, AtualizarLivroDTO } from '../types/index.js';

export class LivroValidator {
  private static readonly ISBN_REGEX = /^\d{3}-\d{1}-\d{2}-\d{6}-\d{1}$/;

  static validarISBN(isbn: string): boolean {
    return this.ISBN_REGEX.test(isbn);
  }

  static validarCriarLivro(data: CriarLivroDTO): { valido: boolean; erro?: string } {
    if (!data.titulo || typeof data.titulo !== 'string' || data.titulo.trim() === '') {
      return { valido: false, erro: 'Título é obrigatório e deve ser uma string não vazia' };
    }

    if (!data.autor || typeof data.autor !== 'string' || data.autor.trim() === '') {
      return { valido: false, erro: 'Autor é obrigatório e deve ser uma string não vazia' };
    }

    if (!data.isbn || typeof data.isbn !== 'string') {
      return { valido: false, erro: 'ISBN é obrigatório' };
    }

    if (!this.validarISBN(data.isbn)) {
      return { valido: false, erro: 'ISBN inválido. Formato esperado: XXX-X-XX-XXXXXX-X' };
    }

    if (typeof data.quantidadeTotal !== 'number' || !Number.isInteger(data.quantidadeTotal) || data.quantidadeTotal < 1) {
      return { valido: false, erro: 'Quantidade total deve ser um número inteiro >= 1' };
    }

    return { valido: true };
  }

  static validarAtualizarLivro(data: AtualizarLivroDTO): { valido: boolean; erro?: string } {
    const hasFields = Object.keys(data).length > 0;
    if (!hasFields) {
      return { valido: false, erro: 'Body não pode estar vazio' };
    }

    if (data.titulo !== undefined) {
      if (typeof data.titulo !== 'string' || data.titulo.trim() === '') {
        return { valido: false, erro: 'Título deve ser uma string não vazia' };
      }
    }

    if (data.autor !== undefined) {
      if (typeof data.autor !== 'string' || data.autor.trim() === '') {
        return { valido: false, erro: 'Autor deve ser uma string não vazia' };
      }
    }

    if (data.isbn !== undefined) {
      if (typeof data.isbn !== 'string' || !this.validarISBN(data.isbn)) {
        return { valido: false, erro: 'ISBN inválido. Formato esperado: XXX-X-XX-XXXXXX-X' };
      }
    }

    if (data.quantidadeTotal !== undefined) {
      if (typeof data.quantidadeTotal !== 'number' || !Number.isInteger(data.quantidadeTotal) || data.quantidadeTotal < 1) {
        return { valido: false, erro: 'Quantidade total deve ser um número inteiro >= 1' };
      }
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
