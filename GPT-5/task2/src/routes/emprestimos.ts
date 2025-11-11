import { Router, type Request, type Response } from 'express';
import { EmprestimosService } from '../services/emprestimosService.js';
import { isValidIdParam } from '../utils/validators.js';

export const emprestimosRouter = Router();

// POST /emprestimos
emprestimosRouter.post('/', (req: Request, res: Response) => {
  const result = EmprestimosService.create(req.body);
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(201).json(result.value);
});

// GET /emprestimos
emprestimosRouter.get('/', (_req: Request, res: Response) => {
  const list = EmprestimosService.list();
  return res.status(200).json(list);
});

// GET /emprestimos/:id
emprestimosRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidIdParam(id)) return res.status(400).json({ error: 'id inválido' });
  const emp = EmprestimosService.getById(Number(id));
  if (!emp) return res.status(404).json({ error: 'não encontrado' });
  return res.status(200).json(emp);
});

// PATCH /emprestimos/:id/devolver
emprestimosRouter.patch('/:id/devolver', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidIdParam(id)) return res.status(400).json({ error: 'id inválido' });
  const result = EmprestimosService.devolver(Number(id));
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(200).json(result.value);
});

// DELETE /emprestimos/:id
emprestimosRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidIdParam(id)) return res.status(400).json({ error: 'id inválido' });
  const result = EmprestimosService.cancelar(Number(id));
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(204).send();
});
