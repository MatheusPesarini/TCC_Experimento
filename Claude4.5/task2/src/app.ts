
import express, { Express } from 'express';
import { LivroRepository } from './repositories/LivroRepository.js';
import { EmprestimoRepository } from './repositories/EmprestimoRepository.js';
import { LivroService } from './services/LivroService.js';
import { EmprestimoService } from './services/EmprestimoService.js';
import { LivroController } from './controllers/LivroController.js';
import { EmprestimoController } from './controllers/EmprestimoController.js';
import { createLivroRoutes } from './routes/livroRoutes.js';
import { createEmprestimoRoutes } from './routes/emprestimoRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

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
