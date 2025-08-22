import express, { Request, Response } from 'express';

export interface User {
  id: number;
  name: string;
  email: string;
}

export function buildApp() {
  const app = express();
  app.use(express.json());

  let seq = 1;
  const users = new Map<number, User>();

  app.post('/users', (req: Request, res: Response) => {
    const { name, email } = req.body || {};
    if (!name || !email) return res.status(400).json({ message: 'name and email are required' });
    const id = seq++;
    const user: User = { id, name, email };
    users.set(id, user);
    return res.status(201).json(user);
  });

  app.get('/users', (_req: Request, res: Response) => {
    return res.json(Array.from(users.values()));
  });

  app.get('/users/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = users.get(id);
    if (!user) return res.status(404).json({ message: 'not found' });
    return res.json(user);
  });

  app.put('/users/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = users.get(id);
    if (!user) return res.status(404).json({ message: 'not found' });
    const { name, email } = req.body || {};
    if (!name && !email) return res.status(400).json({ message: 'no fields to update' });
    const updated: User = { ...user, ...(name ? { name } : {}), ...(email ? { email } : {}) };
    users.set(id, updated);
    return res.json(updated);
  });

  app.delete('/users/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!users.has(id)) return res.status(404).json({ message: 'not found' });
    users.delete(id);
    return res.status(204).send();
  });

  return app;
}
