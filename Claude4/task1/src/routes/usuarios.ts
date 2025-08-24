
import { Router, Request, Response } from 'express';
import { usuarioService } from '../services/usuarioService.js';
import { isValidId } from '../utils/validation.js';

const router = Router();

// POST /usuarios
router.post('/', (req: Request, res: Response) => {
  try {
    const usuario = usuarioService.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email já existe') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Erro interno' });
    }
  }
});

// GET /usuarios
router.get('/', (req: Request, res: Response) => {
  const usuarios = usuarioService.findAll();
  res.status(200).json(usuarios);
});

// GET /usuarios/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  const usuario = usuarioService.findById(parseInt(id, 10));
  if (!usuario) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  res.status(200).json(usuario);
});

// PATCH /usuarios/:id
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  try {
    const usuario = usuarioService.update(parseInt(id, 10), req.body);
    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.status(200).json(usuario);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email já existe') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Erro interno' });
    }
  }
});

// DELETE /usuarios/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  const deleted = usuarioService.delete(parseInt(id, 10));
  if (!deleted) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  res.status(204).send();
});

export default router;
