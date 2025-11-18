// filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\GPT-5\task3\src\server.ts
import app from './app.js';

// Servidor opcional para execução manual (não usado nos testes)
if (process.env.RUN_SERVER === 'true') {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Servidor iniciado na porta ${port}`);
  });
}

export default app;
