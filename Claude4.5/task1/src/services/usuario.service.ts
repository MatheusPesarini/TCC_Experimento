/**
 * Serviço de Usuários (lógica de negócio)
 */

import { UsuarioRepository } from '../repositories/usuario.repository.js';
import {
  Usuario,
  CriarUsuarioInput,
  AtualizarUsuarioInput,
  UsuarioDTO,
} from '../types/usuario.types.js';
import {
  isValidEmail,
  isValidPassword,
  isValidNome,
} from '../utils/validators.js';

export class UsuarioService {
  constructor(private repository: UsuarioRepository) { }

  /**
   * Converte Usuario para DTO (remove senha)
   */
  private toDTO(usuario: { id: number; nome: string; email: string; dataDeCriacao: string }): UsuarioDTO {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      dataDeCriacao: usuario.dataDeCriacao,
    };
  }

  /**
   * Cria um novo usuário
   */
  criar(dados: CriarUsuarioInput): { success: true; data: UsuarioDTO } | { success: false; error: string; status: number } {
    // Validações
    if (!dados.nome || !isValidNome(dados.nome)) {
      return { success: false, error: 'Nome é obrigatório e deve ser uma string válida', status: 400 };
    }

    if (!dados.email || !isValidEmail(dados.email)) {
      return { success: false, error: 'Email inválido', status: 400 };
    }

    if (!dados.senha || !isValidPassword(dados.senha)) {
      return { success: false, error: 'Senha deve ter no mínimo 6 caracteres', status: 400 };
    }

    // Verificar email duplicado
    const existente = this.repository.buscarPorEmail(dados.email);
    if (existente) {
      return { success: false, error: 'Email já está em uso', status: 409 };
    }

    // Criar usuário
    const usuario = this.repository.criar(dados);
    return { success: true, data: this.toDTO(usuario) };
  }

  /**
   * Lista todos os usuários
   */
  listarTodos(): UsuarioDTO[] {
    const usuarios = this.repository.listarTodos();
    return usuarios.map(u => this.toDTO(u));
  }

  /**
   * Busca usuário por ID
   */
  buscarPorId(id: number): { success: true; data: UsuarioDTO } | { success: false; error: string; status: number } {
    const usuario = this.repository.buscarPorId(id);

    if (!usuario) {
      return { success: false, error: 'Usuário não encontrado', status: 404 };
    }

    return { success: true, data: this.toDTO(usuario) };
  }

  /**
   * Atualiza um usuário
   */
  atualizar(
    id: number,
    dados: AtualizarUsuarioInput
  ): { success: true; data: UsuarioDTO } | { success: false; error: string; status: number } {
    // Validar se há pelo menos um campo para atualizar
    const temCampos = dados.nome !== undefined || dados.email !== undefined || dados.senha !== undefined;
    if (!temCampos) {
      return { success: false, error: 'Nenhum campo fornecido para atualização', status: 400 };
    }

    // Verificar se usuário existe
    const usuarioExistente = this.repository.buscarPorId(id);
    if (!usuarioExistente) {
      return { success: false, error: 'Usuário não encontrado', status: 404 };
    }

    // Preparar dados de atualização (somente campos fornecidos)
    const dadosAtualizacao: Partial<Omit<Usuario, 'id' | 'dataDeCriacao'>> = {};

    // Validar e adicionar nome se fornecido
    if (dados.nome !== undefined) {
      if (!isValidNome(dados.nome)) {
        return { success: false, error: 'Nome inválido', status: 400 };
      }
      dadosAtualizacao.nome = dados.nome;
    }

    // Validar e adicionar email se fornecido
    if (dados.email !== undefined) {
      if (!isValidEmail(dados.email)) {
        return { success: false, error: 'Email inválido', status: 400 };
      }

      // Verificar email duplicado (se estiver alterando email)
      if (dados.email !== usuarioExistente.email) {
        const emailEmUso = this.repository.buscarPorEmail(dados.email);
        if (emailEmUso) {
          return { success: false, error: 'Email já está em uso', status: 409 };
        }
      }
      dadosAtualizacao.email = dados.email;
    }

    // Validar e adicionar senha se fornecida
    if (dados.senha !== undefined) {
      if (!isValidPassword(dados.senha)) {
        return { success: false, error: 'Senha deve ter no mínimo 6 caracteres', status: 400 };
      }
      dadosAtualizacao.senha = dados.senha;
    }

    // Atualizar
    const atualizado = this.repository.atualizar(id, dadosAtualizacao);
    if (!atualizado) {
      return { success: false, error: 'Erro ao atualizar usuário', status: 500 };
    }

    return { success: true, data: this.toDTO(atualizado) };
  }

  /**
   * Remove um usuário
   */
  deletar(id: number): { success: true } | { success: false; error: string; status: number } {
    const sucesso = this.repository.deletar(id);

    if (!sucesso) {
      return { success: false, error: 'Usuário não encontrado', status: 404 };
    }

    return { success: true };
  }
}
