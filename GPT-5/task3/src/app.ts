// filepath: c:\Users\mathe\Desktop\TCC_Experimento\GPT-5\task3\src\app.ts
import express, { json } from 'express';
import produtosRouter from './routes/produtos.js';
import pedidosRouter from './routes/pedidos.js';

const app = express();

app.use(json());

app.use('/produtos', produtosRouter);
app.use('/pedidos', pedidosRouter);

export default app;
