import { Livro } from '../models';

let books: Livro[] = [];
let nextId = 1;

export const booksRepository = {
  create(data: Omit<Livro, 'id' | 'dataDeCadastro' | 'quantidadeDisponivel'> & { quantidadeTotal: number }): Livro {
    const livro: Livro = {
      id: nextId++,
      titulo: data.titulo,
      autor: data.autor,
      isbn: data.isbn,
      quantidadeTotal: data.quantidadeTotal,
      quantidadeDisponivel: data.quantidadeTotal,
      dataDeCadastro: new Date().toISOString()
    };
    books.push(livro);
    return livro;
  },
  findAll(): Livro[] {
    return books.slice();
  },
  findById(id: number): Livro | undefined {
    return books.find(b => b.id === id);
  },
  findByIsbn(isbn: string): Livro | undefined {
    return books.find(b => b.isbn === isbn);
  },
  update(livro: Livro): Livro {
    const idx = books.findIndex(b => b.id === livro.id);
    if (idx >= 0) books[idx] = livro;
    return livro;
  },
  delete(id: number): void {
    books = books.filter(b => b.id !== id);
  },
  countActiveLoans(livroId: number, getLoanStatus: (livroId: number) => number): number {
    return getLoanStatus(livroId);
  },
  clearAll(): void {
    books = [];
    nextId = 1;
  }
};
