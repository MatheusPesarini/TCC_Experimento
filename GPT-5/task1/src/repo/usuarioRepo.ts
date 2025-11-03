import { CreateUsuarioInput, UpdateUsuarioInput, Usuario } from '../types';

class UsuarioRepo {
  private data: Usuario[] = [];
  private nextId = 1;

  public findAll(): Usuario[] {
    return this.data;
  }

  public findById(id: number): Usuario | undefined {
    return this.data.find((u) => u.id === id);
  }

  public existsEmail(email: string, excludeId?: number): boolean {
    return this.data.some(
      (u) => u.email === email && (excludeId === undefined || u.id !== excludeId),
    );
  }

  public create(input: CreateUsuarioInput): Usuario {
    const usuario: Usuario = {
      id: this.nextId++,
      nome: input.nome,
      email: input.email,
      senha: input.senha,
      dataDeCriacao: new Date().toISOString(),
    };
    this.data.push(usuario);
    return usuario;
  }

  public update(id: number, patch: UpdateUsuarioInput): Usuario | undefined {
    const u = this.findById(id);
    if (!u) return undefined;
    if (patch.nome !== undefined) u.nome = patch.nome;
    if (patch.email !== undefined) u.email = patch.email;
    if (patch.senha !== undefined) u.senha = patch.senha;
    return u;
  }

  public deleteById(id: number): boolean {
    const idx = this.data.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.data.splice(idx, 1);
    return true;
  }
}

export const usuarioRepo = new UsuarioRepo();
