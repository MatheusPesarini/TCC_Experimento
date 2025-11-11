
import { Livro, CreateLivroDTO, UpdateLivroDTO } from '../types/index.js';

export class LivroRepository {
  private livros: Livro[] = [];
  private nextId: number = 1;

  create(data: CreateLivroDTO): Livro {
    const livro: Livro = {
      id: this.nextId++,
      titulo: data.titulo,
      autor: data.autor,
      isbn: data.isbn,
      quantidadeTotal: data.quantidadeTotal,
      quantidadeDisponivel: data.quantidadeTotal,
      dataDeCadastro: new Date().toISOString()
    };

    this.livros.push(livro);
    return livro;
  }

  findAll(): Livro[] {
    return [...this.livros];
  }

  findById(id: number): Livro | undefined {
    return this.livros.find(livro => livro.id === id);
  }

  findByIsbn(isbn: string): Livro | undefined {
    return this.livros.find(livro => livro.isbn === isbn);
  }

  update(id: number, data: UpdateLivroDTO): Livro | undefined {
    const index = this.livros.findIndex(livro => livro.id === id);
    if (index === -1) {
      return undefined;
    }

    this.livros[index] = {
      ...this.livros[index],
      ...data
    };

    return this.livros[index];
  }

  delete(id: number): boolean {
    const index = this.livros.findIndex(livro => livro.id === id);
    if (index === -1) {
      return false;
    }

    this.livros.splice(index, 1);
    return true;
  }

  decrementarDisponivel(id: number): boolean {
    const livro = this.findById(id);
    if (!livro || livro.quantidadeDisponivel <= 0) {
      return false;
    }

    livro.quantidadeDisponivel--;
    return true;
  }

  incrementarDisponivel(id: number): boolean {
    const livro = this.findById(id);
    if (!livro || livro.quantidadeDisponivel >= livro.quantidadeTotal) {
      return false;
    }

    livro.quantidadeDisponivel++;
    return true;
  }
}
