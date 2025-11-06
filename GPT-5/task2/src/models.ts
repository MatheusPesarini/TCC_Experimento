// Core domain models and types for the library system

export type Livro = {
  id: number;
  titulo: string;
  autor: string;
  isbn: string; // formato: XXX-X-XX-XXXXXX-X
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  dataDeCadastro: string; // ISO 8601
};

export type EmprestimoStatus = 'ativo' | 'devolvido';

export type Emprestimo = {
  id: number;
  livroId: number;
  nomeUsuario: string;
  emailUsuario: string;
  dataEmprestimo: string; // ISO 8601
  dataPrevistaDevolucao: string; // ISO 8601 (14 dias depois)
  dataDevolvido?: string; // ISO 8601
  status: EmprestimoStatus;
};

// Enriched views used in responses (não obrigatório nos testes, mas útil)
export type EmprestimoComLivroBasico = Emprestimo & {
  livro?: Pick<Livro, 'titulo' | 'autor'>;
};

export type EmprestimoComLivroCompleto = Emprestimo & {
  livro?: Livro;
};
