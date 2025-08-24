import express, { Request, Response, NextFunction } from 'express';

// Tipos fortes
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string; // nunca retornar
  dataDeCriacao: string; // ISO string
}

interface UsuarioPublico {
  id: number | string; // o teste aceita string | number
  nome: string;
  email: string;
  dataDeCriacao: string;
}

// Repositório em memória
const usuarios: Usuario[] = [];
let nextId = 1;

// Helpers
const toPublic = (u: Usuario): UsuarioPublico => ({ id: u.id, nome: u.nome, email: u.email, dataDeCriacao: u.dataDeCriacao });

const isValidEmail = (email: unknown): email is string =>
  typeof email === 'string' && /.+@.+\..+/.test(email);

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

// Middleware para JSON e content-type
const app = express();
app.use(express.json());

// Erro handler auxiliar
function error(status: number, message?: string) {
  return { status, message };
}

// Rotas
// POST /usuarios
app.post('/usuarios', (req: Request, res: Response) => {
  const { nome, email, senha } = req.body ?? {};

  if (!isNonEmptyString(nome) || !isValidEmail(email) || !isNonEmptyString(senha)) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'Senha muito curta' });
  }

  const emailEmUso = usuarios.some(u => u.email.toLowerCase() === (email as string).toLowerCase());
  if (emailEmUso) {
    return res.status(409).json({ erro: 'Email já cadastrado' });
  }

  const novo: Usuario = {
    id: nextId++,
    nome: nome.trim(),
    email: (email as string).trim(),
    senha: senha,
    dataDeCriacao: new Date().toISOString(),
  };
  usuarios.push(novo);

  return res.status(201).json(toPublic(novo));
});

// GET /usuarios
app.get('/usuarios', (_req: Request, res: Response) => {
  const lista = usuarios.map(toPublic);
  return res.status(200).json(lista);
});

// GET /usuarios/:id
app.get('/usuarios/:id', (req: Request, res: Response) => {
  const idParam = req.params.id;
  const idNum = Number(idParam);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  const user = usuarios.find(u => u.id === idNum);
  if (!user) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  return res.status(200).json(toPublic(user));
});

// PATCH /usuarios/:id
app.patch('/usuarios/:id', (req: Request, res: Response) => {
  const idParam = req.params.id;
  const idNum = Number(idParam);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  const body = req.body ?? {};
  const hasKeys = body && Object.keys(body).length > 0;
  if (!hasKeys) {
    return res.status(400).json({ erro: 'Body vazio' });
  }

  const user = usuarios.find(u => u.id === idNum);
  if (!user) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  // Atualizações permitidas: nome, email, senha (mas senha não é retornada)
  if (body.nome !== undefined) {
    if (!isNonEmptyString(body.nome)) {
      return res.status(400).json({ erro: 'Nome inválido' });
    }
    user.nome = body.nome.trim();
  }

  if (body.email !== undefined) {
    if (!isValidEmail(body.email)) {
      return res.status(400).json({ erro: 'Email inválido' });
    }
    const novoEmail = (body.email as string).trim();
    const conflita = usuarios.some(u => u.email.toLowerCase() === novoEmail.toLowerCase() && u.id !== user.id);
    if (conflita) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    user.email = novoEmail;
  }

  if (body.senha !== undefined) {
    if (!isNonEmptyString(body.senha) || (body.senha as string).length < 6) {
      return res.status(400).json({ erro: 'Senha inválida' });
    }
    user.senha = body.senha as string;
  }

  return res.status(200).json(toPublic(user));
});

// DELETE /usuarios/:id
app.delete('/usuarios/:id', (req: Request, res: Response) => {
  const idParam = req.params.id;
  const idNum = Number(idParam);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  const idx = usuarios.findIndex(u => u.id === idNum);
  if (idx === -1) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  usuarios.splice(idx, 1);
  return res.status(204).send();
});

// Fallback de erro (não usado explicitamente, mas útil)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno' });
});

export default app;
