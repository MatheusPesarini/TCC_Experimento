### Task 3

------------------------------------------------------------------------

Objetivo
Implemente um Sistema de Gerenciamento de Pedidos com Controle de Estoque em Node.js usando TypeScript e Express 5.1.0. O código deve rodar e passar 100% dos testes do arquivo:
c:\Users\mathe\Área de Trabalho\TCC_Experimento\[MODELO]\task3\task3.test.ts
(Não altere o teste.)

Ambiente/Versões
- Node.js 22.20.0 LTS
- TypeScript 5.9.3 (strict mode habilitado)
- Express 5.1.0
- Testes: Vitest + Supertest (já configurados no projeto)

Requisitos Funcionais

MÓDULO 1 - Produtos
Endpoints: POST /produtos, GET /produtos, GET /produtos/:id, PATCH /produtos/:id, DELETE /produtos/:id

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;              // Máximo 2 decimais
  categoria: string;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  ativo: boolean;            // Padrão: true
  dataDeCadastro: string;    // ISO 8601
}

MÓDULO 2 - Pedidos
Endpoints: POST /pedidos, GET /pedidos, GET /pedidos/:id, PATCH /pedidos/:id/status, PATCH /pedidos/:id/cancelar, DELETE /pedidos/:id

interface Pedido {
  id: number;
  clienteNome: string;
  clienteEmail: string;
  clienteEndereco: string;
  itens: ItemPedido[];
  subtotal: number;           // Calculado automaticamente
  desconto: number;           // 0 a 100% do subtotal
  total: number;              // subtotal - desconto
  status: StatusPedido;
  dataDoPedido: string;       // ISO 8601
  dataAtualizacao: string;    // ISO 8601
}

interface ItemPedido {
  produtoId: number;
  nomeProduto: string;        // Snapshot do nome
  quantidade: number;
  precoUnitario: number;      // Snapshot do preço
  subtotal: number;           // quantidade * precoUnitario
}

type StatusPedido = 'pendente' | 'confirmado' | 'enviado' | 'entregue' | 'cancelado';

Comportamento Esperado

PRODUTOS:
- POST /produtos → 201 criado | 400 inválido | preco com 2 decimais | ativo=true padrão
- GET /produtos → 200 array | Filtros: ?categoria=X&ativo=true
- GET /produtos/:id → 200 encontrado | 400 id inválido | 404 inexistente | Incluir alerta se estoque < estoqueMinimo
- PATCH /produtos/:id → 200 atualizado | 400 body vazio/inválido | 404 inexistente | Permitir atualização parcial
- DELETE /produtos/:id → 204 sucesso | 400 id inválido | 404 inexistente | 409 se está em pedidos não cancelados

PEDIDOS:
- POST /pedidos → 201 criado | 400 inválido | 404 produtoId inexistente | 409 produto inativo OU estoque insuficiente
  * Decrementa quantidadeEstoque automaticamente
  * Calcula subtotal de cada item e do pedido
  * Aplica desconto e calcula total
  * Faz snapshot de nome e preço em cada item
  * status inicia como 'pendente'
  
- GET /pedidos → 200 array | Filtros: ?status=X&clienteEmail=Y | Incluir contagem de itens

- GET /pedidos/:id → 200 encontrado | 400 id inválido | 404 inexistente | Incluir itens completos + info atual dos produtos

- PATCH /pedidos/:id/status → 200 atualizado | 400 status inválido/transição inválida | 404 inexistente | 409 se cancelado
  * Transições válidas: pendente→confirmado, confirmado→enviado, enviado→entregue
  * Atualiza dataAtualizacao

- PATCH /pedidos/:id/cancelar → 200 cancelado | 400 id inválido | 404 inexistente | 409 se já cancelado OU entregue
  * Retorna quantidadeEstoque de todos os produtos
  * Atualiza status para 'cancelado'
  * Atualiza dataAtualizacao

- DELETE /pedidos/:id → 204 sucesso | 400 id inválido | 404 inexistente | 409 se status ≠ 'pendente'
  * Retorna quantidadeEstoque de todos os produtos

Validações Obrigatórias

PRODUTOS POST:
- nome, descricao, categoria: obrigatórios, não vazios
- preco: obrigatório, > 0, máximo 2 decimais
- quantidadeEstoque, estoqueMinimo: obrigatórios, inteiros >= 0

PEDIDOS POST:
- clienteNome, clienteEndereco: obrigatórios, não vazios
- clienteEmail: obrigatório, formato válido
- itens: obrigatório, array não vazio
- Cada item: produtoId (número válido), quantidade (inteiro > 0)
- desconto: opcional, >= 0 e <= subtotal calculado
- Validar produtos existem, ativos, estoque suficiente

PEDIDOS PATCH status:
- novoStatus: obrigatório, valor válido de StatusPedido
- Validar transição permitida

Regras de Negócio Críticas

1. Controle de Estoque:
   - Criar pedido decrementa estoque atomicamente
   - Cancelar/Deletar pedido retorna estoque
   - quantidadeEstoque NUNCA negativo
   - Não criar pedido se estoque insuficiente

2. Integridade Referencial:
   - Não criar pedido com produtos inexistentes/inativos
   - Não deletar produto em pedidos não cancelados

3. Máquina de Estados (transições unidirecionais):
   - pendente → confirmado → enviado → entregue
   - Cancelado não pode mudar status
   - Entregue não pode ser cancelado
   - Apenas pendente pode ser deletado

4. Cálculos Financeiros (2 decimais):
   - subtotal item = quantidade * precoUnitario (snapshot)
   - subtotal pedido = soma subtotais dos itens
   - desconto: >= 0 e <= subtotal
   - total = subtotal - desconto

5. Snapshot de Dados:
   - Itens mantêm nome e preço do produto no momento do pedido
   - Modificações futuras no produto não afetam pedidos históricos

6. Atomicidade:
   - Criar pedido: ou reserva estoque de TODOS os itens ou falha completamente
   - Cancelar: retorna estoque de TODOS os itens

Restrições Técnicas
- Express 5.1.0 + bibliotecas de validação comuns (validator, zod, joi, express-validator)
- Validações seguras (evitar ReDoS)
- Tipagem forte (sem 'any')
- Clean Code e SOLID
- Não iniciar servidor no código (testes fazem isso)
- export default app
- Armazenamento em memória (arrays)
- Lógica transacional para operações de estoque
- Precisão decimal em cálculos financeiros

Liberdade Arquitetural
Total liberdade para: estrutura de pastas, padrões arquiteturais (MVC, DDD, camadas, repositories, services), nomenclatura, funções auxiliares, middlewares, tipos customizados, classes para cálculos, separação de validações/regras/estoque. (Não crie estruturas em único arquivo)

Formato da Resposta
1) Estrutura de pastas (formato árvore)
2) Código completo de cada arquivo:
   - TypeScript com syntax highlighting
   - Primeira linha: // filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\[MODELO]\task3\src\...
3) Instruções de execução (npm install, npm test)

Critérios de Aceitação
✓ 100% dos testes passam
✓ Código executável sem erros
✓ Relacionamento produtos-pedidos consistente
✓ Regras de estoque funcionam (atomicidade)
✓ Máquina de estados respeita transições
✓ Cálculos financeiros corretos e precisos
✓ Snapshots funcionam
✓ Datas em ISO 8601
✓ Status HTTP corretos
✓ Validações funcionam
✓ Boas práticas TypeScript e segurança
✓ Integridade referencial e transacional mantida

------------------------------------------------------------------------