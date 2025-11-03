/**
 * Aplicação Express - Configuração principal
 */

import express from 'express';
import { UsuarioRepository } from './repositories/usuario.repository.js';
import { UsuarioService } from './services/usuario.service.js';
import { UsuarioController } from './controllers/usuario.controller.js';
import { criarRotasUsuario } from './routes/usuario.routes.js';

// Criar instância do Express
const app = express();

// Middlewares
app.use(express.json());

// Injeção de dependências
const usuarioRepository = new UsuarioRepository();
const usuarioService = new UsuarioService(usuarioRepository);
const usuarioController = new UsuarioController(usuarioService);

// Rotas
const rotasUsuario = criarRotasUsuario(usuarioController);
app.use(rotasUsuario);

// Exportar app (não iniciar servidor aqui - os testes fazem isso)
export default app;
