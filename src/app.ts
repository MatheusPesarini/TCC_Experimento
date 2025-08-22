import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rota de health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'TCC Experimento - API de Testes',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Aqui serão implementadas as rotas pelos LLMs:
// - CRUD de usuário: /usuarios
// - Lógica de compra: /pedidos, /produtos
// - Integração API externa: /pagamentos

export default app;

// Iniciar servidor apenas se executado diretamente
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}
