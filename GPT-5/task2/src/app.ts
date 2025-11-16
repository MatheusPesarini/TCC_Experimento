import express from 'express';
import { booksRouter } from './routes/booksRoutes';
import { loansRouter } from './routes/loansRoutes';

const app = express();
app.use(express.json());

app.use(booksRouter);
app.use(loansRouter);

// Middleware para Content-Type JSON em respostas com corpo
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Rota de saúde opcional (não utilizada nos testes)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
