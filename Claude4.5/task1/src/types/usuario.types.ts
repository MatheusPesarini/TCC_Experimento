/**
 * Tipos e interfaces relacionados ao domínio de Usuário
 */

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  dataDeCriacao: string;
}

export interface UsuarioDTO {
  id: number;
  nome: string;
  email: string;
  dataDeCriacao: string;
}

export interface CriarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
}

export interface AtualizarUsuarioInput {
  nome?: string;
  email?: string;
  senha?: string;
}
