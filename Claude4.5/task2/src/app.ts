
import express, { Express } from 'express';
import { LivroRepository } from './repositories/LivroRepository';
import { EmprestimoRepository } from './repositories/EmprestimoRepository';
import { LivroService } from './services/LivroService';
import { EmprestimoService } from './services/EmprestimoService';
import { LivroController } from './controllers/LivroController';
import { EmprestimoController } from './controllers/EmprestimoController';
import { createLivroRoutes } from './routes/livroRoutes';
import { createEmprestimoRoutes } from './routes/emprestimoRoutes';
import { errorHandler } from './middlewares/errorHandler';

// Criar instâncias dos repositórios
const livroRepository = new LivroRepository();
const emprestimoRepository = new EmprestimoRepository();

// Criar instâncias dos serviços
const livroService = new LivroService(livroRepository, emprestimoRepository);
const emprestimoService = new EmprestimoService(emprestimoRepository, livroRepository);

// Criar instâncias dos controllers
const livroController = new LivroController(livroService);
const emprestimoController = new EmprestimoController(emprestimoService);

// Criar aplicação Express
const app: Express = express();

// Middlewares globais
app.use(express.json());

// Rotas
app.use('/livros', createLivroRoutes(livroController));
app.use('/emprestimos', createEmprestimoRoutes(emprestimoController));

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app;
