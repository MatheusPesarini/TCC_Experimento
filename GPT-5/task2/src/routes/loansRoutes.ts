import { Router } from 'express';
import { loansService } from '../services/loansService';

export const loansRouter = Router();

loansRouter.post('/emprestimos', (req, res) => {
  try {
    const emprestimo = loansService.create(req.body);
    res.status(201).json(emprestimo);
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});

loansRouter.get('/emprestimos', (_req, res) => {
  try {
    const emprestimos = loansService.list();
    res.status(200).json(emprestimos);
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});

loansRouter.get('/emprestimos/:id', (req, res) => {
  try {
    const emprestimo = loansService.get(req.params.id);
    res.status(200).json(emprestimo);
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});

loansRouter.patch('/emprestimos/:id/devolver', (req, res) => {
  try {
    const emprestimo = loansService.devolver(req.params.id);
    res.status(200).json(emprestimo);
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});

loansRouter.delete('/emprestimos/:id', (req, res) => {
  try {
    loansService.cancelar(req.params.id);
    res.status(204).send();
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});
