import app from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

if (!Number.isFinite(PORT) || PORT <= 0) {
  throw new Error('PORT inválida');
}

// Iniciar servidor somente quando executado diretamente (não nos testes)
const server = app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});

export default server;