### Task 2

------------------------------------------------------------------------

Objetivo
Implemente um Sistema de Gerenciamento de Biblioteca em Node.js usando TypeScript e Express 5.1.0. O sistema deve gerenciar livros e empréstimos com regras de negócio específicas. O código deve rodar e passar 100% dos testes do arquivo:
c:\Users\mathe\Área de Trabalho\TCC_Experimento\[MODELO]\task2\task2.test.ts
(Não altere o teste.)

Ambiente/Versões
- Node.js 22.20.0 LTS
- TypeScript 5.9.3 (strict mode habilitado)
- Express 5.1.0
- Testes: Vitest + Supertest (já configurados no projeto)

Requisitos Funcionais

MÓDULO 1 - Gerenciamento de Livros
Endpoints obrigatórios:
- POST /livros - Criar novo livro
- GET /livros - Listar todos os livros
- GET /livros/:id - Buscar livro por ID
- PATCH /livros/:id - Atualizar livro parcialmente
- DELETE /livros/:id - Remover livro (só se não estiver emprestado)

Modelo de Dados - Livro:
interface Livro {
  id: number;              // Identificador numérico único
  titulo: string;
  autor: string;
  isbn: string;            // Deve ser único no sistema (formato: XXX-X-XX-XXXXXX-X)
  quantidadeTotal: number; // Quantidade total de exemplares
  quantidadeDisponivel: number; // Exemplares disponíveis para empréstimo
  dataDeCadastro: string;  // ISO 8601 format
}

MÓDULO 2 - Gerenciamento de Empréstimos
Endpoints obrigatórios:
- POST /emprestimos - Criar novo empréstimo
- GET /emprestimos - Listar todos os empréstimos
- GET /emprestimos/:id - Buscar empréstimo por ID
- PATCH /emprestimos/:id/devolver - Devolver livro (atualiza status)
- DELETE /emprestimos/:id - Cancelar empréstimo (só se ainda não devolvido)

Modelo de Dados - Empréstimo:
interface Emprestimo {
  id: number;                  // Identificador numérico único
  livroId: number;            // ID do livro emprestado
  nomeUsuario: string;        // Nome de quem pegou emprestado
  emailUsuario: string;       // Email do usuário
  dataEmprestimo: string;     // ISO 8601 - data em que foi emprestado
  dataPrevistaDevolucao: string; // ISO 8601 - 14 dias após empréstimo
  dataDevolvido?: string;     // ISO 8601 - preenchido apenas após devolução
  status: 'ativo' | 'devolvido'; // Status do empréstimo
}

Comportamento Esperado (conforme contrato de testes)

LIVROS:
- POST /livros
  → Status 201 com livro criado
  → Status 400 para payload inválido (campos faltando, ISBN inválido, quantidades inválidas)
  → Status 409 para ISBN duplicado
  → quantidadeDisponivel deve iniciar igual a quantidadeTotal
  
- GET /livros
  → Status 200 com array de livros
  → Deve incluir informação de disponibilidade de cada livro
  
- GET /livros/:id
  → Status 200 com livro encontrado
  → Status 400 para id inválido (não numérico)
  → Status 404 para id inexistente
  
- PATCH /livros/:id
  → Status 200 com livro atualizado
  → Status 400 para body vazio ou id inválido
  → Status 404 para id inexistente
  → Status 409 para ISBN duplicado em atualização
  → Permitir atualização parcial de campos
  → Não permitir que quantidadeTotal seja menor que (quantidadeTotal - quantidadeDisponivel)
  
- DELETE /livros/:id
  → Status 204 sem corpo na resposta
  → Status 400 para id inválido
  → Status 404 para id inexistente
  → Status 409 se o livro tiver empréstimos ativos (não pode deletar)

EMPRÉSTIMOS:
- POST /emprestimos
  → Status 201 com empréstimo criado
  → Status 400 para payload inválido (campos faltando, email inválido, livroId inválido)
  → Status 404 se livroId não existir
  → Status 409 se não houver exemplares disponíveis do livro
  → Deve decrementar quantidadeDisponivel do livro automaticamente
  → dataPrevistaDevolucao deve ser calculada automaticamente (14 dias após dataEmprestimo)
  → status deve iniciar como 'ativo'
  → dataDevolvido não deve estar presente na criação
  
- GET /emprestimos
  → Status 200 com array de empréstimos
  → Cada empréstimo deve incluir informações básicas do livro associado (titulo, autor)
  
- GET /emprestimos/:id
  → Status 200 com empréstimo encontrado
  → Deve incluir informações completas do livro associado
  → Status 400 para id inválido
  → Status 404 para id inexistente
  
- PATCH /emprestimos/:id/devolver
  → Status 200 com empréstimo atualizado
  → Status 400 para id inválido
  → Status 404 para id inexistente
  → Status 409 se empréstimo já foi devolvido
  → Deve incrementar quantidadeDisponivel do livro automaticamente
  → Deve atualizar status para 'devolvido'
  → Deve preencher dataDevolvido com timestamp atual
  
- DELETE /emprestimos/:id
  → Status 204 sem corpo na resposta
  → Status 400 para id inválido
  → Status 404 para id inexistente
  → Status 409 se empréstimo já foi devolvido (não pode cancelar)
  → Deve incrementar quantidadeDisponivel do livro automaticamente

Todas as respostas com corpo devem ter Content-Type: application/json

Validações Obrigatórias

LIVROS:
POST /livros:
- titulo: obrigatório, string não vazia
- autor: obrigatório, string não vazia
- isbn: obrigatório, formato válido ISBN-13 (XXX-X-XX-XXXXXX-X)
- quantidadeTotal: obrigatório, número inteiro >= 1
- quantidadeDisponivel não deve ser fornecido pelo usuário (calculado automaticamente)

PATCH /livros/:id:
- Rejeitar requisições com body vazio
- Validar ISBN se fornecido (formato válido e único)
- Validar quantidades se fornecidas (números inteiros positivos)
- Validar regra de negócio: quantidadeTotal >= (quantidadeTotal - quantidadeDisponivel)

EMPRÉSTIMOS:
POST /emprestimos:
- livroId: obrigatório, número inteiro válido
- nomeUsuario: obrigatório, string não vazia
- emailUsuario: obrigatório, formato válido de email
- dataEmprestimo: obrigatório, formato ISO 8601
- Validar que livro existe e tem exemplares disponíveis

PATCH /emprestimos/:id/devolver:
- Validar que empréstimo existe e está com status 'ativo'
- Não aceitar body (operação é apenas de mudança de status)

Regras de Negócio Críticas

1. Integridade Referencial:
   - Não permitir criar empréstimo de livro inexistente
   - Não permitir deletar livro com empréstimos ativos

2. Controle de Estoque:
   - quantidadeDisponivel NUNCA pode ser negativa
   - quantidadeDisponivel NUNCA pode ser maior que quantidadeTotal
   - Emprestar livro decrementa quantidadeDisponivel
   - Devolver/Cancelar empréstimo incrementa quantidadeDisponivel

3. Status de Empréstimo:
   - Apenas empréstimos 'ativo' podem ser devolvidos
   - Apenas empréstimos 'ativo' podem ser cancelados
   - Devolução é irreversível (não pode voltar para 'ativo')

4. Cálculo de Datas:
   - dataPrevistaDevolucao sempre 14 dias após dataEmprestimo
   - dataDevolvido só existe após devolução efetiva

Restrições Técnicas
- Usar apenas Express 5.1.0 e bibliotecas de validação/utilitários comuns (ex: validator, zod, joi, express-validator)
- Implementar validações de forma segura, evitando vulnerabilidades como ReDoS em regex
- Tipagem forte: não usar 'any' em nenhum lugar do código
- Seguir princípios de Clean Code e SOLID
- Não iniciar o servidor HTTP nos arquivos de código (os testes fazem isso)
- Exportar a instância do Express app como export default
- Armazenamento em memória (arrays) é suficiente para este experimento
- Implementar relacionamento entre livros e empréstimos de forma consistente

Liberdade Arquitetural
Total liberdade para: estrutura de pastas, padrões arquiteturais (MVC, DDD, camadas, repositories, services), nomenclatura, funções auxiliares, middlewares, tipos customizados, classes para cálculos, separação de validações/regras/estoque. (Não crie estruturas em único arquivo)

O importante é que o código passe em todos os testes, seja bem estruturado e mantenha a consistência dos dados.

Formato da Resposta
1) Liste a estrutura de pastas/arquivos que você criou, no formato de árvore

2) Forneça o código completo de cada arquivo necessário:
   - Use blocos de código TypeScript com syntax highlighting
   - Inclua na primeira linha de cada bloco um comentário com o caminho completo:
     // filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\[MODELO]\task2\src\app.ts

3) Forneça instruções de execução:
   - Comandos npm necessários (se houver dependências adicionais)
   - Comando para rodar os testes (npm test)

Critérios de Aceitação
✓ Todos os testes em task2.test.ts devem passar (100% de sucesso)
✓ O código deve ser executável sem erros de compilação
✓ Relacionamento entre livros e empréstimos deve estar consistente
✓ Regras de negócio de estoque devem funcionar corretamente
✓ Todas as datas devem estar no formato ISO 8601 válido
✓ Códigos de status HTTP devem estar corretos conforme especificado
✓ Todas as validações devem funcionar como descrito
✓ Código deve seguir boas práticas de TypeScript e segurança
✓ Integridade referencial deve ser mantida em todas as operações

------------------------------------------------------------------------