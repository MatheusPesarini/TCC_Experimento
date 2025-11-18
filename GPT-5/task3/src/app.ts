// filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\GPT-5\task3\src\app.ts
import express, { Request, Response } from 'express';
import produtosRouter from './routes/products.js';
import pedidosRouter from './routes/orders.js';

const app = express();
app.use(express.json());

app.use('/produtos', produtosRouter);
app.use('/pedidos', pedidosRouter);

// Fallback 404 para rotas não definidas
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'rota não encontrada' });
});

export default app;
