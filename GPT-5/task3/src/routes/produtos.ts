import { Router, Request, Response } from 'express';
import { productService } from '../services/productService.js';
import { parseIdParam } from '../utils/validation.js';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const result = productService.create(req.body);
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(201).json(result.value);
});

router.get('/', (req: Request, res: Response) => {
  const { categoria, ativo } = req.query as { categoria?: string; ativo?: string };
  const list = productService.list({ categoria, ativo });
  return res.json(list);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });
  const produto = productService.getById(id);
  if (!produto) return res.status(404).json({ error: 'não encontrado' });
  return res.json(produto);
});

router.patch('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });
  const result = productService.update(id, req.body);
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.json(result.value);
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });
  const result = productService.delete(id);
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(204).send();
});

export default router;
