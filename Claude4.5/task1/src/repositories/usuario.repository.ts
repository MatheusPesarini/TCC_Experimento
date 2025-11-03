/**
 * Repositório de Usuários (armazenamento em memória)
 */

import { Usuario } from '../types/usuario.types.js';

export class UsuarioRepository {
  private usuarios: Usuario[] = [];
  private currentId: number = 1;

  /**
   * Cria um novo usuário
   */
  criar(dados: Omit<Usuario, 'id' | 'dataDeCriacao'>): Usuario {
    const novoUsuario: Usuario = {
      id: this.currentId++,
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      dataDeCriacao: new Date().toISOString(),
    };

    this.usuarios.push(novoUsuario);
    return novoUsuario;
  }

  /**
   * Busca usuário por ID
   */
  buscarPorId(id: number): Usuario | undefined {
    return this.usuarios.find(u => u.id === id);
  }

  /**
   * Busca usuário por email
   */
  buscarPorEmail(email: string): Usuario | undefined {
    return this.usuarios.find(u => u.email === email);
  }

  /**
   * Lista todos os usuários
   */
  listarTodos(): Usuario[] {
    return [...this.usuarios];
  }

  /**
   * Atualiza um usuário existente
   */
  atualizar(id: number, dados: Partial<Omit<Usuario, 'id' | 'dataDeCriacao'>>): Usuario | undefined {
    const index = this.usuarios.findIndex(u => u.id === id);

    if (index === -1) {
      return undefined;
    }

    this.usuarios[index] = {
      ...this.usuarios[index],
      ...dados,
    };

    return this.usuarios[index];
  }

  /**
   * Remove um usuário
   */
  deletar(id: number): boolean {
    const index = this.usuarios.findIndex(u => u.id === id);

    if (index === -1) {
      return false;
    }

    this.usuarios.splice(index, 1);
    return true;
  }
}
