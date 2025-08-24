
import { User, UserCreateRequest, UserUpdateRequest } from '../models/user.js';
import { isValidEmail, isValidPassword } from '../utils/validation.js';

class UserService {
  private users: User[] = [];
  private nextId = 1;

  createUser(userData: UserCreateRequest): User {
    // Validações
    if (!userData.nome || !userData.email || !userData.senha) {
      throw new Error('MISSING_FIELDS');
    }

    if (!isValidEmail(userData.email)) {
      throw new Error('INVALID_EMAIL');
    }

    if (!isValidPassword(userData.senha)) {
      throw new Error('INVALID_PASSWORD');
    }

    // Verificar email duplicado
    if (this.users.some(user => user.email === userData.email)) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const user: User = {
      id: this.nextId++,
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha,
      dataDeCriacao: new Date().toISOString()
    };

    this.users.push(user);
    return user;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: number): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  updateUser(id: number, userData: UserUpdateRequest): User | null {
    const userIndex = this.users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      return null;
    }

    // Verificar se body não está vazio
    const hasValidFields = userData.nome !== undefined ||
      userData.email !== undefined ||
      userData.senha !== undefined;

    if (!hasValidFields) {
      throw new Error('EMPTY_BODY');
    }

    // Validar email se fornecido
    if (userData.email !== undefined && !isValidEmail(userData.email)) {
      throw new Error('INVALID_EMAIL');
    }

    // Validar senha se fornecida
    if (userData.senha !== undefined && !isValidPassword(userData.senha)) {
      throw new Error('INVALID_PASSWORD');
    }

    // Verificar email duplicado se email está sendo alterado
    if (userData.email && userData.email !== this.users[userIndex].email) {
      if (this.users.some(user => user.email === userData.email)) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...userData
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  deleteUser(id: number): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }
}

export const userService = new UserService();
