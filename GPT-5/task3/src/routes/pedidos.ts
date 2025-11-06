// filepath: c:\Users\mathe\Desktop\TCC_Experimento\GPT-5\task3\src\routes\pedidos.ts
import { Router, Request, Response } from 'express';
import { orderService } from '../services/orderService.js';
import { parseIdParam } from '../utils/validation.js';

const router = Router();

// POST /pedidos
router.post('/', (req: Request, res: Response) => {
  const result = orderService.create(req.body);
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(201).json(result.value);
});

// GET /pedidos
router.get('/', (req: Request, res: Response) => {
  const { status, clienteEmail } = req.query as { status?: string; clienteEmail?: string };
  const list = orderService.list({ status, clienteEmail });
  return res.json(list);
});

// GET /pedidos/:id
router.get('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });
  const pedido = orderService.getById(id);
  if (!pedido) return res.status(404).json({ error: 'não encontrado' });
  return res.json(pedido);
});

// PATCH /pedidos/:id/status
router.patch('/:id/status', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });
  const result = orderService.updateStatus(id, req.body?.novoStatus);
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.json(result.value);
});

// PATCH /pedidos/:id/cancelar
router.patch('/:id/cancelar', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });
  const result = orderService.cancel(id);
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.json(result.value);
});

// DELETE /pedidos/:id
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'id inválido' });
  const result = orderService.delete(id);
  if (!result.ok) return res.status(result.code).json({ error: result.message });
  return res.status(204).send();
});

export default router;
