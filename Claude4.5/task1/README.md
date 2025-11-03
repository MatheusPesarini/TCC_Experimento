# CRUD de Usuários - Node.js com TypeScript e Express 5.1.0

## ✅ Status
**Todos os testes passaram: 9/9 (100%)**

## 📁 Estrutura de Pastas/Arquivos

```
task1/
├── src/
│   ├── types/
│   │   └── usuario.types.ts          # Interfaces e tipos do domínio
│   ├── utils/
│   │   └── validators.ts             # Validadores (email, senha, ID, etc)
│   ├── repositories/
│   │   └── usuario.repository.ts     # Camada de persistência (memória)
│   ├── services/
│   │   └── usuario.service.ts        # Lógica de negócio
│   ├── controllers/
│   │   └── usuario.controller.ts     # Manipulação de requisições HTTP
│   ├── routes/
│   │   └── usuario.routes.ts         # Definição de rotas
│   └── app.ts                        # Configuração do Express (export default)
├── dist/                             # Código JavaScript compilado
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── task1.test.ts                     # Testes (não modificado)
└── script.js                         # Script de teste de carga k6
```

## 🏗️ Arquitetura

O projeto segue uma **arquitetura em camadas** (layered architecture) com separação clara de responsabilidades:

- **Types**: Definições de tipos e interfaces TypeScript
- **Utils**: Funções utilitárias e validadores
- **Repository**: Camada de acesso a dados (persistência em memória)
- **Service**: Lógica de negócio e regras de validação
- **Controller**: Manipulação de requisições e respostas HTTP
- **Routes**: Definição e configuração de rotas
- **App**: Configuração principal do Express com injeção de dependências

### Princípios Aplicados

✅ **SOLID**
- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Dependency Inversion**: Uso de injeção de dependências

✅ **Clean Code**
- Nomes descritivos e significativos
- Funções pequenas e focadas
- Comentários JSDoc para documentação
- Tipagem forte (sem uso de `any`)

✅ **Segurança**
- Regex seguro para validação de email (evita ReDoS)
- Senha nunca é retornada nas respostas
- Validações rigorosas de entrada

## 🚀 Instruções de Execução

### Pré-requisitos
- Node.js 22.20.0 LTS

### Instalar Dependências
```bash
npm install
```

### Compilar o Código
```bash
npm run build
```

### Executar Testes
```bash
npm test
```

Para executar os testes uma única vez (sem watch mode):
```bash
npm test -- --run
```

### Executar com Cobertura
```bash
npm run test:coverage
```

## 📋 Endpoints Implementados

### POST /usuarios
Cria um novo usuário.

**Body:**
```json
{
  "nome": "Maria Silva",
  "email": "maria@exemplo.com",
  "senha": "senhaSegura123"
}
```

**Respostas:**
- `201`: Usuário criado (sem campo senha)
- `400`: Dados inválidos
- `409`: Email já existe

### GET /usuarios
Lista todos os usuários.

**Respostas:**
- `200`: Array de usuários (sem campo senha)

### GET /usuarios/:id
Busca um usuário por ID.

**Respostas:**
- `200`: Usuário encontrado (sem campo senha)
- `400`: ID inválido
- `404`: Usuário não encontrado

### PATCH /usuarios/:id
Atualiza um usuário parcialmente.

**Body (qualquer combinação):**
```json
{
  "nome": "Novo Nome",
  "email": "novo@email.com",
  "senha": "novaSenha123"
}
```

**Respostas:**
- `200`: Usuário atualizado (sem campo senha)
- `400`: Dados inválidos ou body vazio
- `404`: Usuário não encontrado
- `409`: Email já existe

### DELETE /usuarios/:id
Remove um usuário.

**Respostas:**
- `204`: Usuário removido (sem corpo)
- `400`: ID inválido
- `404`: Usuário não encontrado

## ✅ Validações Implementadas

### POST /usuarios
- Nome: obrigatório, string não vazia
- Email: obrigatório, formato válido
- Senha: obrigatória, mínimo 6 caracteres
- Email único no sistema

### PATCH /usuarios/:id
- Rejeita body vazio (sem campos)
- Email: formato válido (se fornecido)
- Senha: mínimo 6 caracteres (se fornecida)
- Email único (se alterado)
- Atualização parcial permitida

### Todos os Endpoints
- Validação de ID numérico válido
- Content-Type: application/json
- Senha nunca é retornada
- Data de criação em formato ISO 8601

## 🔒 Segurança

- **Regex seguro**: Validação de email com regex simples que evita ReDoS
- **Sem exposição de senha**: Campo senha nunca é retornado nas respostas
- **Tipagem forte**: TypeScript strict mode sem uso de `any`
- **Validações rigorosas**: Todas as entradas são validadas

## 📦 Dependências

### Produção
- `express`: ^5.1.0 - Framework web
- `typescript`: ^5.9.3 - Linguagem
- `@types/express`: ^5.0.4 - Tipos TypeScript para Express
- `@types/node`: ^24.9.1 - Tipos TypeScript para Node.js

### Desenvolvimento
- `vitest`: ^4.0.2 - Framework de testes
- `supertest`: ^7.1.4 - Testes HTTP
- `@types/supertest`: ^6.0.3 - Tipos TypeScript para Supertest
- `@vitest/coverage-v8`: ^4.0.2 - Cobertura de testes

## 📊 Resultados dos Testes

```
✓ deve executar o fluxo completo de CRUD
✓ deve retornar 400 ao tentar criar usuário sem campos obrigatórios
✓ Validações e erros adicionais (7)
  ✓ deve retornar 400 para dados inválidos (email inválido e senha curta)
  ✓ deve retornar 409 ao criar usuário com email duplicado
  ✓ GET /usuarios/:id deve retornar 404 quando não existir
  ✓ PATCH /usuarios/:id deve retornar 400 para id inválido
  ✓ PATCH /usuarios/:id deve retornar 404 quando não existir
  ✓ PATCH deve retornar 400 quando body estiver vazio
  ✓ DELETE /usuarios/:id deve retornar 404 quando não existir

Test Files  1 passed (1)
     Tests  9 passed (9)
```

**✅ 100% de sucesso nos testes!**
