### Task 1

------------------------------------------------------------------------

Objetivo
Implemente um CRUD de usuário em Node.js usando TypeScript e Express 5.1.0. O código deve rodar e passar 100% dos testes do arquivo:
c:\Users\mathe\Área de Trabalho\TCC_Experimento\[MODELO]\task1\task1.test.ts
(Não altere o teste.)

Ambiente/Versões
- Node.js 22.20.0 LTS
- TypeScript 5.9.2 (strict mode habilitado)
- Express 5.1.0
- Testes: Vitest + Supertest (já configurados no projeto)

Requisitos Funcionais
Endpoints obrigatórios:
- POST /usuarios - Criar novo usuário
- GET /usuarios - Listar todos os usuários
- GET /usuarios/:id - Buscar usuário por ID
- PATCH /usuarios/:id - Atualizar usuário parcialmente
- DELETE /usuarios/:id - Remover usuário

Modelo de Dados:
interface Usuario {
  id: number;           // Identificador numérico único
  nome: string;
  email: string;        // Deve ser único no sistema
  senha: string;        // Nunca deve ser retornado nas respostas
  dataDeCriacao: string; // ISO 8601 format (ex: "2025-10-20T12:30:00.000Z")
}

Comportamento Esperado (conforme contrato de testes):
- POST /usuarios
  → Status 201 com usuário criado (sem campo senha)
  → Status 400 para payload inválido (campos faltando, email inválido, senha < 6 chars)
  → Status 409 para email duplicado
  
- GET /usuarios
  → Status 200 com array de usuários (sem campo senha)
  
- GET /usuarios/:id
  → Status 200 com usuário encontrado (sem campo senha)
  → Status 400 para id inválido (ex: "abc", id não numérico)
  → Status 404 para id inexistente
  
- PATCH /usuarios/:id
  → Status 200 com usuário atualizado (sem campo senha)
  → Status 400 para body vazio ou id inválido
  → Status 404 para id inexistente
  → Status 409 para email duplicado em atualização
  → Permitir atualização parcial (qualquer combinação de nome/email/senha)
  
- DELETE /usuarios/:id
  → Status 204 sem corpo na resposta
  → Status 400 para id inválido
  → Status 404 para id inexistente
  
- Requisições GET após DELETE devem retornar 404
- Todas as respostas com corpo devem ter Content-Type: application/json

Validações Obrigatórias
POST /usuarios:
- nome: obrigatório, string não vazia
- email: obrigatório, formato válido de email
- senha: obrigatória, mínimo 6 caracteres

PATCH /usuarios/:id:
- Rejeitar requisições com body vazio (sem campos para atualizar)
- Validar email se fornecido (formato válido)
- Validar senha se fornecida (mínimo 6 caracteres)
- Permitir atualização de qualquer campo individualmente
- Manter regra de unicidade do email

Restrições Técnicas
- Usar apenas Express 5.1.0 e bibliotecas de validação/utilitários comuns (ex: validator, zod, joi, express-validator)
- Implementar validações de forma segura, evitando vulnerabilidades como ReDoS em regex
- Tipagem forte: não usar 'any' em nenhum lugar do código
- Seguir princípios de Clean Code e SOLID
- Não iniciar o servidor HTTP nos arquivos de código (os testes fazem isso)
- Exportar a instância do Express app como export default
- Armazenamento em memória (array) é suficiente para este experimento

Liberdade Arquitetural
Você tem total liberdade para:
- Organizar estrutura de pastas e arquivos
- Escolher padrões arquiteturais (MVC, camadas, etc)
- Nomear arquivos, classes, funções e variáveis
- Adicionar funções auxiliares, middlewares, tipos customizados

O importante é que o código passe em todos os testes e seja bem estruturado.

Formato da Resposta
1) Liste a estrutura de pastas/arquivos que você criou, no formato de árvore:
   Exemplo:
   src/
   ├── app.ts
   ├── routes/
   │   └── usuario.routes.ts
   ├── controllers/
   │   └── usuario.controller.ts
   └── models/
       └── usuario.model.ts

2) Forneça o código completo de cada arquivo necessário:
   - Use blocos de código TypeScript com syntax highlighting
   - Inclua na primeira linha de cada bloco um comentário com o caminho completo:
     // filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\[MODELO]\task1\src\app.ts

3) Forneça instruções de execução:
   - Comandos npm necessários (se houver dependências adicionais)
   - Comando para rodar os testes (npm test)

4) (Opcional) Breve explicação das escolhas arquiteturais (máximo 5 linhas)

Critérios de Aceitação
✓ Todos os testes em task1.test.ts devem passar (100% de sucesso)
✓ O código deve ser executável sem erros de compilação
✓ Respostas da API nunca devem expor o campo 'senha'
✓ dataDeCriacao deve estar no formato ISO 8601 válido
✓ Códigos de status HTTP devem estar corretos conforme especificado
✓ Todas as validações devem funcionar como descrito
✓ Código deve seguir boas práticas de TypeScript e segurança

------------------------------------------------------------------------