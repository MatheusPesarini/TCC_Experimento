import app from './app.js';

const portEnv = process.env.PORT;
const port = portEnv ? Number(portEnv) : 3000;

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('PORT inválida');
}

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
