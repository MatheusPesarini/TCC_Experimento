import { Usuario, UsuarioPublico } from '../types.js';

export const toPublicUser = (u: Usuario): UsuarioPublico => {
  // Remover campo senha nas respostas
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { senha: _senha, ...rest } = u;
  return rest;
};

export const toPublicList = (arr: Usuario[]): UsuarioPublico[] => arr.map(toPublicUser);
