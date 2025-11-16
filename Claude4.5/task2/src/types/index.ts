
export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  dataDeCadastro: string;
}

export interface CriarLivroDTO {
  titulo: string;
  autor: string;
  isbn: string;
  quantidadeTotal: number;
}

export interface AtualizarLivroDTO {
  titulo?: string;
  autor?: string;
  isbn?: string;
  quantidadeTotal?: number;
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

export interface CriarEmprestimoDTO {
  livroId: number;
  nomeUsuario: string;
  emailUsuario: string;
  dataEmprestimo: string;
}

export interface EmprestimoComLivro extends Emprestimo {
  livro: {
    titulo: string;
    autor: string;
  };
}
