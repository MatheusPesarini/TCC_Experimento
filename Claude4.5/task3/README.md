# Sistema de Gerenciamento de Pedidos com Controle de Estoque

Sistema completo de gerenciamento de pedidos com controle de estoque implementado em Node.js, TypeScript e Express 5.1.0.

## 📁 Estrutura do Projeto

```
task3/
├── src/
│   ├── app.ts                          # Aplicação Express principal
│   ├── types/
│   │   ├── produto.types.ts            # Interfaces e DTOs de Produto
│   │   ├── pedido.types.ts             # Interfaces e DTOs de Pedido
│   │   └── errors.types.ts             # Classes de erros customizadas
│   ├── middlewares/
│   │   └── error-handler.ts            # Middleware de tratamento de erros
│   ├── utils/
│   │   └── validators.ts               # Funções auxiliares de validação
│   ├── repositories/
│   │   ├── produto.repository.ts       # Repositório de produtos (in-memory)
│   │   └── pedido.repository.ts        # Repositório de pedidos (in-memory)
│   ├── services/
│   │   ├── produto.service.ts          # Lógica de negócio de produtos
│   │   └── pedido.service.ts           # Lógica de negócio de pedidos
│   ├── controllers/
│   │   ├── produto.controller.ts       # Controller de produtos
│   │   └── pedido.controller.ts        # Controller de pedidos
│   └── routes/
│       ├── produtos.routes.ts          # Rotas de produtos
│       └── pedidos.routes.ts           # Rotas de pedidos
├── task3.test.ts                       # Testes E2E
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 🚀 Tecnologias

- **Node.js** 22.20.0 LTS
- **TypeScript** 5.9.3 (strict mode)
- **Express** 5.1.0
- **Vitest** + **Supertest** (testes)
- **Validator** (validação de email)

## 📦 Instalação

```bash
npm install
```

## 🧪 Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## 📋 Funcionalidades

### MÓDULO 1 - Produtos

#### Endpoints

- `POST /produtos` - Criar produto
- `GET /produtos` - Listar produtos (com filtros)
- `GET /produtos/:id` - Buscar produto por ID
- `PATCH /produtos/:id` - Atualizar produto
- `DELETE /produtos/:id` - Deletar produto

#### Exemplo de Produto

```json
{
  "id": 1,
  "nome": "Notebook Dell",
  "descricao": "Notebook i7 16GB RAM",
  "preco": 3499.99,
  "categoria": "Eletrônicos",
  "quantidadeEstoque": 10,
  "estoqueMinimo": 2,
  "ativo": true,
  "dataDeCadastro": "2025-11-06T14:00:00.000Z"
}
```

### MÓDULO 2 - Pedidos

#### Endpoints

- `POST /pedidos` - Criar pedido
- `GET /pedidos` - Listar pedidos (com filtros)
- `GET /pedidos/:id` - Buscar pedido por ID
- `PATCH /pedidos/:id/status` - Atualizar status do pedido
- `PATCH /pedidos/:id/cancelar` - Cancelar pedido
- `DELETE /pedidos/:id` - Deletar pedido (apenas pendentes)

#### Exemplo de Pedido

```json
{
  "id": 1,
  "clienteNome": "João Silva",
  "clienteEmail": "joao@exemplo.com",
  "clienteEndereco": "Rua A, 123",
  "itens": [
    {
      "produtoId": 1,
      "nomeProduto": "Notebook Dell",
      "quantidade": 2,
      "precoUnitario": 3499.99,
      "subtotal": 6999.98
    }
  ],
  "subtotal": 6999.98,
  "desconto": 100.00,
  "total": 6899.98,
  "status": "pendente",
  "dataDoPedido": "2025-11-06T14:00:00.000Z",
  "dataAtualizacao": "2025-11-06T14:00:00.000Z"
}
```

## 🔒 Regras de Negócio

### Controle de Estoque
- Criar pedido decrementa estoque atomicamente
- Cancelar/Deletar pedido retorna estoque
- `quantidadeEstoque` nunca pode ser negativo
- Não criar pedido se estoque insuficiente

### Integridade Referencial
- Não criar pedido com produtos inexistentes ou inativos
- Não deletar produto presente em pedidos não cancelados

### Máquina de Estados (Pedidos)
- Transições válidas: `pendente → confirmado → enviado → entregue`
- Pedido cancelado não pode mudar status
- Pedido entregue não pode ser cancelado
- Apenas pedidos pendentes podem ser deletados

### Cálculos Financeiros
- Preços com máximo 2 decimais
- `subtotal item = quantidade × precoUnitario`
- `subtotal pedido = soma dos subtotais dos itens`
- `total = subtotal - desconto`
- Desconto deve ser ≥ 0 e ≤ subtotal

### Snapshot de Dados
- Itens mantêm nome e preço do produto no momento do pedido
- Modificações futuras no produto não afetam pedidos históricos

### Atomicidade
- Criar pedido: reserva estoque de TODOS os itens ou falha completamente
- Cancelar: retorna estoque de TODOS os itens

## ✅ Validações

### Produtos
- Nome, descrição, categoria: obrigatórios, não vazios
- Preço: obrigatório, > 0, máximo 2 decimais
- Quantidades: inteiros ≥ 0

### Pedidos
- Cliente (nome, email, endereço): obrigatórios
- Email: formato válido
- Itens: array não vazio
- Quantidade: inteiro > 0
- Desconto: ≥ 0 e ≤ subtotal

## 📊 Status HTTP

- `200` - OK (GET, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validação)
- `404` - Not Found (recurso inexistente)
- `409` - Conflict (regras de negócio)

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas:

1. **Routes** - Definição de rotas e endpoints
2. **Controllers** - Recebem requests e retornam responses
3. **Services** - Lógica de negócio e validações
4. **Repositories** - Acesso aos dados (in-memory)
5. **Types** - Interfaces e tipos TypeScript
6. **Utils** - Funções auxiliares
7. **Middlewares** - Tratamento de erros

### Princípios Aplicados
- **SOLID** - Separação de responsabilidades
- **Clean Code** - Código legível e manutenível
- **Tipo seguro** - TypeScript strict mode
- **Validações robustas** - Evita ReDoS e edge cases
- **Transações** - Atomicidade em operações de estoque

## 📝 Notas

- Os dados são armazenados em memória (arrays)
- Cada execução dos testes reinicia o estado
- Datas em formato ISO 8601
- Precisão decimal mantida em cálculos financeiros
- Todos os 39 testes E2E passam com sucesso ✅
