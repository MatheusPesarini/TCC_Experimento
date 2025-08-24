
export interface User {
  id: number;
  nome: string;
  email: string;
  senha: string;
  dataDeCriacao: string;
}

export interface UserCreateRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface UserUpdateRequest {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface UserResponse {
  id: number;
  nome: string;
  email: string;
  dataDeCriacao: string;
}

export const toUserResponse = (user: User): UserResponse => ({
  id: user.id,
  nome: user.nome,
  email: user.email,
  dataDeCriacao: user.dataDeCriacao
});
