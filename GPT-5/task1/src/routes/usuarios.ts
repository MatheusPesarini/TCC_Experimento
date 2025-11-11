import { Router, Request, Response } from 'express';
import { usuarioRepo } from '../repo/usuarioRepo.js';
import {
  hasAtLeastOneUpdatableField,
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  parseIdParam,
} from '../utils/validators.js';
import { toPublicList, toPublicUser } from '../utils/transform.js';
import { UpdateUsuarioInput } from '../types.js';

export const usuariosRouter = Router();

// POST /usuarios - Criar novo usuário
usuariosRouter.post('/', (req: Request, res: Response) => {
  const body = req.body as unknown;

  const nome = (body as Record<string, unknown>)?.nome;
  const email = (body as Record<string, unknown>)?.email;
  const senha = (body as Record<string, unknown>)?.senha;

  if (!isNonEmptyString(nome) || !isValidEmail(email) || !isValidPassword(senha)) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  // unicidade de email
  if (usuarioRepo.existsEmail(email)) {
    return res.status(409).json({ erro: 'Email já cadastrado' });
  }

  const created = usuarioRepo.create({ nome, email, senha });
  return res.status(201).json(toPublicUser(created));
});

// GET /usuarios - Listar todos
usuariosRouter.get('/', (_req: Request, res: Response) => {
  const all = usuarioRepo.findAll();
  return res.status(200).json(toPublicList(all));
});

// GET /usuarios/:id - Buscar por ID
usuariosRouter.get('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido' });

  const u = usuarioRepo.findById(id);
  if (!u) return res.status(404).json({ erro: 'Usuário não encontrado' });
  return res.status(200).json(toPublicUser(u));
});

// PATCH /usuarios/:id - Atualizar parcialmente
usuariosRouter.patch('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido' });

  const body = req.body as unknown;

  if (!hasAtLeastOneUpdatableField(body ?? {})) {
    return res.status(400).json({ erro: 'Body vazio' });
  }

  const existing = usuarioRepo.findById(id);
  if (!existing) return res.status(404).json({ erro: 'Usuário não encontrado' });

  const patch = (body ?? {}) as UpdateUsuarioInput;

  // validações condicionais
  if (patch.nome !== undefined && !isNonEmptyString(patch.nome)) {
    return res.status(400).json({ erro: 'Nome inválido' });
  }
  if (patch.email !== undefined) {
    if (!isValidEmail(patch.email)) return res.status(400).json({ erro: 'Email inválido' });
    if (usuarioRepo.existsEmail(patch.email, id)) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
  }
  if (patch.senha !== undefined && !isValidPassword(patch.senha)) {
    return res.status(400).json({ erro: 'Senha inválida' });
  }

  const updated = usuarioRepo.update(id, patch);
  return res.status(200).json(toPublicUser(updated!));
});

// DELETE /usuarios/:id - Remover
usuariosRouter.delete('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido' });

  const ok = usuarioRepo.deleteById(id);
  if (!ok) return res.status(404).json({ erro: 'Usuário não encontrado' });
  return res.status(204).end();
});

export default usuariosRouter;
