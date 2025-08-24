
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  dataDeCriacao: string;
}

export interface UsuarioInput {
  nome: string;
  email: string;
  senha: string;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  dataDeCriacao: string;
}

export interface UsuarioUpdateInput {
  nome?: string;
  email?: string;
  senha?: string;
}
