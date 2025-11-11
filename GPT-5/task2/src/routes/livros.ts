import { Router, type Request, type Response } from 'express';
import { LivrosService } from '../services/livrosService.js';
import { isValidIdParam } from '../utils/validators.js';

export const livrosRouter = Router();

// POST /livros
livrosRouter.post('/', (req: Request, res: Response) => {
  const result = LivrosService.create(req.body);
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(201).json(result.value);
});

// GET /livros
livrosRouter.get('/', (_req: Request, res: Response) => {
  const list = LivrosService.list();
  return res.status(200).json(list);
});

// GET /livros/:id
livrosRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidIdParam(id)) return res.status(400).json({ error: 'id inválido' });
  const livro = LivrosService.getById(Number(id));
  if (!livro) return res.status(404).json({ error: 'não encontrado' });
  return res.status(200).json(livro);
});

// PATCH /livros/:id
livrosRouter.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidIdParam(id)) return res.status(400).json({ error: 'id inválido' });
  const result = LivrosService.update(Number(id), req.body ?? {});
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(200).json(result.value);
});

// DELETE /livros/:id
livrosRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidIdParam(id)) return res.status(400).json({ error: 'id inválido' });
  const result = LivrosService.delete(Number(id));
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(204).send();
});
