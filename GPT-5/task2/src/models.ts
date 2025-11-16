export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string; // formato XXX-X-XX-XXXXXX-X
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  dataDeCadastro: string; // ISO 8601
}

export type EmprestimoStatus = 'ativo' | 'devolvido';

export interface Emprestimo {
  id: number;
  livroId: number;
  nomeUsuario: string;
  emailUsuario: string;
  dataEmprestimo: string; // ISO 8601
  dataPrevistaDevolucao: string; // ISO 8601 (+14 dias)
  dataDevolvido?: string; // ISO 8601
  status: EmprestimoStatus;
}
