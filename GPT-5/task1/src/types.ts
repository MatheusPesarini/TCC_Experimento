export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  dataDeCriacao: string; // ISO 8601
}

export type UsuarioPublico = Omit<Usuario, 'senha'>;

export type CreateUsuarioInput = Pick<Usuario, 'nome' | 'email' | 'senha'>;
export type UpdateUsuarioInput = Partial<Pick<Usuario, 'nome' | 'email' | 'senha'>>;
