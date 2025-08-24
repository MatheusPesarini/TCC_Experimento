
import { Usuario, UsuarioInput, UsuarioResponse, UsuarioUpdateInput } from '../types.js';
import { isValidEmail, isValidPassword } from '../utils/validation.js';

class UsuarioService {
  private usuarios: Usuario[] = [];
  private nextId = 1;

  private toResponse(usuario: Usuario): UsuarioResponse {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      dataDeCriacao: usuario.dataDeCriacao
    };
  }

  create(input: UsuarioInput): UsuarioResponse {
    // Validações
    if (!input.nome || !input.email || !input.senha) {
      throw new Error('Campos obrigatórios: nome, email, senha');
    }

    if (!isValidEmail(input.email)) {
      throw new Error('Email inválido');
    }

    if (!isValidPassword(input.senha)) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Verificar email duplicado
    if (this.usuarios.some(u => u.email === input.email)) {
      throw new Error('Email já existe');
    }

    const usuario: Usuario = {
      id: this.nextId++,
      nome: input.nome,
      email: input.email,
      senha: input.senha,
      dataDeCriacao: new Date().toISOString()
    };

    this.usuarios.push(usuario);
    return this.toResponse(usuario);
  }

  findAll(): UsuarioResponse[] {
    return this.usuarios.map(u => this.toResponse(u));
  }

  findById(id: number): UsuarioResponse | null {
    const usuario = this.usuarios.find(u => u.id === id);
    return usuario ? this.toResponse(usuario) : null;
  }

  update(id: number, input: UsuarioUpdateInput): UsuarioResponse | null {
    // Verificar se tem pelo menos um campo para atualizar
    if (!input.nome && !input.email && !input.senha) {
      throw new Error('Pelo menos um campo deve ser fornecido para atualização');
    }

    const usuarioIndex = this.usuarios.findIndex(u => u.id === id);
    if (usuarioIndex === -1) {
      return null;
    }

    const usuario = this.usuarios[usuarioIndex];

    // Validar email se fornecido
    if (input.email) {
      if (!isValidEmail(input.email)) {
        throw new Error('Email inválido');
      }
      // Verificar se email já existe em outro usuário
      if (this.usuarios.some(u => u.email === input.email && u.id !== id)) {
        throw new Error('Email já existe');
      }
    }

    // Validar senha se fornecida
    if (input.senha && !isValidPassword(input.senha)) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Atualizar campos
    if (input.nome) usuario.nome = input.nome;
    if (input.email) usuario.email = input.email;
    if (input.senha) usuario.senha = input.senha;

    this.usuarios[usuarioIndex] = usuario;
    return this.toResponse(usuario);
  }

  delete(id: number): boolean {
    const usuarioIndex = this.usuarios.findIndex(u => u.id === id);
    if (usuarioIndex === -1) {
      return false;
    }

    this.usuarios.splice(usuarioIndex, 1);
    return true;
  }
}

export const usuarioService = new UsuarioService();
