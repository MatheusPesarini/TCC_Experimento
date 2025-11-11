import express from 'express';
import { livrosRouter } from './routes/livros.js';
import { emprestimosRouter } from './routes/emprestimos.js';

const app = express();
app.use(express.json());

app.use('/livros', livrosRouter);
app.use('/emprestimos', emprestimosRouter);

export default app;
