import express from 'express';
import produtosRouter from './routes/produtos.routes';
import pedidosRouter from './routes/pedidos.routes';
import { errorHandler } from './middlewares/error-handler';

const app = express();

app.use(express.json());

app.use('/produtos', produtosRouter);
app.use('/pedidos', pedidosRouter);

app.use(errorHandler);

export default app;
