
import express from 'express';
import usuariosRouter from './routes/usuarios.js';

const app = express();

// Middleware para parsing JSON
app.use(express.json());

// Rotas
app.use('/usuarios', usuariosRouter);

export default app;
