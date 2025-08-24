
import express from 'express';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware para parsing de JSON
app.use(express.json());

// Rotas
app.use('/', userRoutes);

export default app;
