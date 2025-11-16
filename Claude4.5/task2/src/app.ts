
import express, { Application } from 'express';
import { LivroRepository } from './repositories/livro-repository.js';
import { EmprestimoRepository } from './repositories/emprestimo-repository.js';
import { LivroService } from './services/livro-service.js';
import { EmprestimoService } from './services/emprestimo-service.js';
import { LivroController } from './controllers/livro-controller.js';
import { EmprestimoController } from './controllers/emprestimo-controller.js';
import { criarLivroRoutes } from './routes/livro-routes.js';
import { criarEmprestimoRoutes } from './routes/emprestimo-routes.js';

// Criar instâncias dos repositórios
const livroRepository = new LivroRepository();
const emprestimoRepository = new EmprestimoRepository();

// Criar instâncias dos services
const livroService = new LivroService(livroRepository, emprestimoRepository);
const emprestimoService = new EmprestimoService(emprestimoRepository, livroRepository);

// Criar instâncias dos controllers
const livroController = new LivroController(livroService);
const emprestimoController = new EmprestimoController(emprestimoService);

// Criar aplicação Express
const app: Application = express();

// Middlewares
app.use(express.json());

// Rotas
app.use(criarLivroRoutes(livroController));
app.use(criarEmprestimoRoutes(emprestimoController));

export default app;
