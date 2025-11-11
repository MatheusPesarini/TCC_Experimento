import express from 'express';
import produtosRouter from './routes/produtos.routes.js';
import pedidosRouter from './routes/pedidos.routes.js';
import { errorHandler } from './middlewares/error-handler.js';

const app = express();

app.use(express.json());

app.use('/produtos', produtosRouter);
app.use('/pedidos', pedidosRouter);

app.use(errorHandler);

export default app;
