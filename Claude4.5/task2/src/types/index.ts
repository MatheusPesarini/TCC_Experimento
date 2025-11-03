
export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  dataDeCadastro: string;
}

export interface Emprestimo {
  id: number;
  livroId: number;
  nomeUsuario: string;
  emailUsuario: string;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolvido?: string;
  status: 'ativo' | 'devolvido';
}

export interface CreateLivroDTO {
  titulo: string;
  autor: string;
  isbn: string;
  quantidadeTotal: number;
}

export interface UpdateLivroDTO {
  titulo?: string;
  autor?: string;
  isbn?: string;
  quantidadeTotal?: number;
}

export interface CreateEmprestimoDTO {
  livroId: number;
  nomeUsuario: string;
  emailUsuario: string;
  dataEmprestimo: string;
}
