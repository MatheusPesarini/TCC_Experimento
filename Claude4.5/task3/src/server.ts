
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📦 Produtos: http://localhost:${PORT}/produtos`);
  console.log(`📋 Pedidos: http://localhost:${PORT}/pedidos`);
});
