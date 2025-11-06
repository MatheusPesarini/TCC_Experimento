import { Emprestimo, Livro } from './models';

// In-memory storage
const livros: Livro[] = [];
const emprestimos: Emprestimo[] = [];

let nextLivroId = 1;
let nextEmprestimoId = 1;

export const DB = {
  // livros
  livros,
  emprestimos,
  genLivroId(): number {
    return nextLivroId++;
  },
  genEmprestimoId(): number {
    return nextEmprestimoId++;
  },
  resetAll(): void {
    livros.length = 0;
    emprestimos.length = 0;
    nextLivroId = 1;
    nextEmprestimoId = 1;
  },
};
