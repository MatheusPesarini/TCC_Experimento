import express, { Request, Response } from 'express';

// Tipos de domínio
export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string; // Formato: XXX-X-XX-XXXXXX-X
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  dataDeCadastro: string; // ISO 8601
}

export type EmprestimoStatus = 'ativo' | 'devolvido';

export interface Emprestimo {
  id: number;
  livroId: number;
  nomeUsuario: string;
  emailUsuario: string;
  dataEmprestimo: string; // ISO 8601
  dataPrevistaDevolucao: string; // ISO 8601 (dataEmprestimo + 14 dias)
  dataDevolvido?: string; // ISO 8601
  status: EmprestimoStatus;
}

// Armazenamento em memória
const livros: Livro[] = [];
const emprestimos: Emprestimo[] = [];
let nextLivroId = 1;
let nextEmprestimoId = 1;

// Utilitários de validação
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isPositiveInt = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 1;

// Evitar ReDoS: regex ancoradas e com quantificadores fixos
const ISBN_REGEX = /^\d{3}-\d-\d{2}-\d{6}-\d$/; // 3-1-2-6-1
const isValidIsbn = (isbn: unknown): isbn is string => typeof isbn === 'string' && ISBN_REGEX.test(isbn);

// Validação de email simples e segura (sem backtracking pesado)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isValidEmail = (email: unknown): email is string => typeof email === 'string' && EMAIL_REGEX.test(email);

// ISO 8601 estrito no formato toISOString()
const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const isValidIso = (iso: unknown): iso is string => typeof iso === 'string' && ISO_REGEX.test(iso);

const parseId = (s: unknown): number | undefined => {
  if (typeof s !== 'string') return undefined;
  if (!/^\d+$/.test(s)) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const findLivroById = (id: number): Livro | undefined => livros.find(l => l.id === id);
const findEmprestimoById = (id: number): Emprestimo | undefined => emprestimos.find(e => e.id === id);

const borrowedCount = (livro: Livro): number => livro.quantidadeTotal - livro.quantidadeDisponivel;

// Express app
const app = express();
app.use(express.json());

// Health (opcional para debugging manual)
app.get('/health', (_req: Request, res: Response) => res.status(200).json({ ok: true }));

// ---------------------- LIVROS ----------------------
// POST /livros - criar livro
app.post('/livros', (req: Request, res: Response) => {
  const { titulo, autor, isbn, quantidadeTotal } = req.body ?? {};

  if (!isNonEmptyString(titulo) || !isNonEmptyString(autor) || !isValidIsbn(isbn) || !isPositiveInt(quantidadeTotal)) {
    return res.status(400).json({ error: 'Payload inválido para criação de livro.' });
  }

  // ISBN único
  if (livros.some(l => l.isbn === isbn)) {
    return res.status(409).json({ error: 'ISBN já existente.' });
  }

  const nowIso = new Date().toISOString();
  const novo: Livro = {
    id: nextLivroId++,
    titulo: titulo.trim(),
    autor: autor.trim(),
    isbn,
    quantidadeTotal,
    quantidadeDisponivel: quantidadeTotal,
    dataDeCadastro: nowIso,
  };

  livros.push(novo);
  return res.status(201).json(novo);
});

// GET /livros - listar
app.get('/livros', (_req: Request, res: Response) => {
  return res.status(200).json(livros);
});

// GET /livros/:id - obter por id
app.get('/livros/:id', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido.' });

  const livro = findLivroById(id);
  if (!livro) return res.status(404).json({ error: 'Livro não encontrado.' });

  return res.status(200).json(livro);
});

// PATCH /livros/:id - atualização parcial
app.patch('/livros/:id', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido.' });

  const livro = findLivroById(id);
  if (!livro) return res.status(404).json({ error: 'Livro não encontrado.' });

  const body = req.body ?? {};
  const allowedKeys = ['titulo', 'autor', 'isbn', 'quantidadeTotal'] as const;
  const keys = Object.keys(body);
  if (keys.length === 0) {
    return res.status(400).json({ error: 'Body vazio.' });
  }

  // Validações de cada campo se presente
  if (Object.prototype.hasOwnProperty.call(body, 'titulo')) {
    if (!isNonEmptyString(body.titulo)) return res.status(400).json({ error: 'titulo inválido.' });
  }
  if (Object.prototype.hasOwnProperty.call(body, 'autor')) {
    if (!isNonEmptyString(body.autor)) return res.status(400).json({ error: 'autor inválido.' });
  }
  if (Object.prototype.hasOwnProperty.call(body, 'isbn')) {
    if (!isValidIsbn(body.isbn)) return res.status(400).json({ error: 'isbn inválido.' });
    if (livros.some(l => l.isbn === body.isbn && l.id !== livro.id)) {
      return res.status(409).json({ error: 'ISBN duplicado.' });
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, 'quantidadeTotal')) {
    if (!isPositiveInt(body.quantidadeTotal)) return res.status(400).json({ error: 'quantidadeTotal inválido.' });

    const emprestados = borrowedCount(livro);
    if (body.quantidadeTotal < emprestados) {
      return res.status(400).json({ error: 'quantidadeTotal menor que exemplares emprestados.' });
    }
  }

  // Aplicar atualização (somente campos permitidos)
  for (const k of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(body, k)) {
      // @ts-expect-error - indexed assignment controlado por allowedKeys
      livro[k] = body[k];
    }
  }

  // Ajuste de disponibilidade para manter consistência (nunca > total)
  const emprestados = borrowedCount(livro);
  if (livro.quantidadeDisponivel > livro.quantidadeTotal) {
    livro.quantidadeDisponivel = Math.max(0, livro.quantidadeTotal - emprestados);
  }

  return res.status(200).json(livro);
});

// DELETE /livros/:id - remover (se não houver empréstimos ativos)
app.delete('/livros/:id', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido.' });

  const idx = livros.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Livro não encontrado.' });

  const hasActiveLoans = emprestimos.some(e => e.livroId === id && e.status === 'ativo');
  if (hasActiveLoans) return res.status(409).json({ error: 'Livro possui empréstimos ativos.' });

  livros.splice(idx, 1);
  return res.status(204).send();
});

// ---------------------- EMPRÉSTIMOS ----------------------
// POST /emprestimos - criar
app.post('/emprestimos', (req: Request, res: Response) => {
  const { livroId, nomeUsuario, emailUsuario, dataEmprestimo } = req.body ?? {};

  if (!isPositiveInt(livroId) || !isNonEmptyString(nomeUsuario) || !isValidEmail(emailUsuario) || !isValidIso(dataEmprestimo)) {
    return res.status(400).json({ error: 'Payload inválido para criação de empréstimo.' });
  }

  const livro = findLivroById(livroId);
  if (!livro) return res.status(404).json({ error: 'Livro inexistente.' });

  if (livro.quantidadeDisponivel <= 0) return res.status(409).json({ error: 'Sem exemplares disponíveis.' });

  // Calcular data prevista (14 dias)
  const empDate = new Date(dataEmprestimo);
  const prevista = new Date(empDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const novo: Emprestimo = {
    id: nextEmprestimoId++,
    livroId,
    nomeUsuario: nomeUsuario.trim(),
    emailUsuario: emailUsuario.trim(),
    dataEmprestimo,
    dataPrevistaDevolucao: prevista,
    status: 'ativo',
  };

  emprestimos.push(novo);

  // Decrementa estoque
  livro.quantidadeDisponivel = Math.max(0, livro.quantidadeDisponivel - 1);

  return res.status(201).json(novo);
});

// GET /emprestimos - listar (com info básica do livro)
app.get('/emprestimos', (_req: Request, res: Response) => {
  const data = emprestimos.map(e => {
    const livro = findLivroById(e.livroId);
    return {
      ...e,
      livro: livro ? { id: livro.id, titulo: livro.titulo, autor: livro.autor } : undefined,
    };
  });
  return res.status(200).json(data);
});

// GET /emprestimos/:id - obter por id (com info do livro)
app.get('/emprestimos/:id', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido.' });

  const emp = findEmprestimoById(id);
  if (!emp) return res.status(404).json({ error: 'Empréstimo não encontrado.' });

  const livro = findLivroById(emp.livroId);
  return res.status(200).json({ ...emp, livro });
});

// PATCH /emprestimos/:id/devolver - devolver livro
app.patch('/emprestimos/:id/devolver', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido.' });

  const emp = findEmprestimoById(id);
  if (!emp) return res.status(404).json({ error: 'Empréstimo não encontrado.' });

  if (emp.status !== 'ativo') return res.status(409).json({ error: 'Empréstimo já devolvido.' });

  emp.status = 'devolvido';
  emp.dataDevolvido = new Date().toISOString();

  const livro = findLivroById(emp.livroId);
  if (livro) {
    // Incrementa estoque, mantendo limite do total
    livro.quantidadeDisponivel = Math.min(livro.quantidadeTotal, livro.quantidadeDisponivel + 1);
  }

  return res.status(200).json(emp);
});

// DELETE /emprestimos/:id - cancelar (apenas se ativo)
app.delete('/emprestimos/:id', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido.' });

  const idx = emprestimos.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Empréstimo não encontrado.' });

  const emp = emprestimos[idx];
  if (emp.status !== 'ativo') return res.status(409).json({ error: 'Não é possível cancelar empréstimo devolvido.' });

  // Remover e restaurar disponibilidade
  emprestimos.splice(idx, 1);
  const livro = findLivroById(emp.livroId);
  if (livro) {
    livro.quantidadeDisponivel = Math.min(livro.quantidadeTotal, livro.quantidadeDisponivel + 1);
  }

  return res.status(204).send();
});

export default app;
