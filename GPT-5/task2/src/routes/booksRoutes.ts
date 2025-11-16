import { Router } from 'express';
import { booksService } from '../services/booksService';

export const booksRouter = Router();

booksRouter.post('/livros', (req, res) => {
  try {
    const livro = booksService.create(req.body);
    res.status(201).json(livro);
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});

booksRouter.get('/livros', (_req, res) => {
  try {
    const livros = booksService.list();
    res.status(200).json(livros);
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});

booksRouter.get('/livros/:id', (req, res) => {
  try {
    const livro = booksService.get(req.params.id);
    res.status(200).json(livro);
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});

booksRouter.patch('/livros/:id', (req, res) => {
  try {
    const livro = booksService.update(req.params.id, req.body);
    res.status(200).json(livro);
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});

booksRouter.delete('/livros/:id', (req, res) => {
  try {
    booksService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    const err = e as { status?: number; message?: string };
    res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
  }
});
