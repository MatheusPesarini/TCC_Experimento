
import express, { Express } from 'express';
import produtoRoutes from './routes/produto.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';

const app: Express = express();

// Middlewares
app.use(express.json());

// Rotas
app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);

export default app;
