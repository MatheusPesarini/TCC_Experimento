
import { Request, Response } from 'express';
import { userService } from '../services/userService.js';
import { UserCreateRequest, UserUpdateRequest, toUserResponse } from '../models/user.js';
import { isValidId } from '../utils/validation.js';

export const createUser = (req: Request, res: Response): void => {
  try {
    const userData: UserCreateRequest = req.body;
    const user = userService.createUser(userData);
    const userResponse = toUserResponse(user);
    res.status(201).json(userResponse);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'MISSING_FIELDS':
        case 'INVALID_EMAIL':
        case 'INVALID_PASSWORD':
          res.status(400).json({ error: 'Dados inválidos' });
          break;
        case 'EMAIL_ALREADY_EXISTS':
          res.status(409).json({ error: 'Email já existe' });
          break;
        default:
          res.status(500).json({ error: 'Erro interno' });
      }
    } else {
      res.status(500).json({ error: 'Erro interno' });
    }
  }
};

export const getAllUsers = (req: Request, res: Response): void => {
  const users = userService.getAllUsers();
  const usersResponse = users.map(toUserResponse);
  res.status(200).json(usersResponse);
};

export const getUserById = (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  const user = userService.getUserById(Number(id));

  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  const userResponse = toUserResponse(user);
  res.status(200).json(userResponse);
};

export const updateUser = (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  try {
    const userData: UserUpdateRequest = req.body;
    const user = userService.updateUser(Number(id), userData);

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const userResponse = toUserResponse(user);
    res.status(200).json(userResponse);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'EMPTY_BODY':
        case 'INVALID_EMAIL':
        case 'INVALID_PASSWORD':
          res.status(400).json({ error: 'Dados inválidos' });
          break;
        case 'EMAIL_ALREADY_EXISTS':
          res.status(409).json({ error: 'Email já existe' });
          break;
        default:
          res.status(500).json({ error: 'Erro interno' });
      }
    } else {
      res.status(500).json({ error: 'Erro interno' });
    }
  }
};

export const deleteUser = (req: Request, res: Response): void => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  const deleted = userService.deleteUser(Number(id));

  if (!deleted) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  res.status(204).send();
};
