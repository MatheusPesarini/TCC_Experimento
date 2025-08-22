# TCC Experimento - Análise de Código Gerado por LLMs

Este projeto implementa o ambiente de testes para coleta de métricas de código TypeScript gerado por modelos de linguagem (GPT-5 e Claude Sonnet 4), conforme metodologia descrita no TCC.

## 🎯 Objetivo

Avaliar a qualidade, segurança e performance de código backend TypeScript gerado por LLMs através de análise automatizada usando Docker, SonarQube, ESLint, Semgrep e Jest.

## 🛠 Tecnologias Utilizadas

- **Node.js** 20.17.1
- **TypeScript** 5.0.4
- **Express** 4.18.2
- **Jest** 29.5.0 (testes)
- **ESLint** 8.42.0 (análise estática)
- **SonarQube** (métricas de qualidade)
- **Semgrep** (análise de segurança SAST)
- **Docker** (ambiente isolado)

## 🚀 Setup Inicial

### Pré-requisitos

1. **Node.js** 20.17.1 ou superior
2. **Docker Desktop** instalado e rodando
3. **PowerShell** (Windows)

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd TCC_Experimento
```

2. Execute o setup automatizado:
```powershell
.\setup.ps1
```

O script irá:
- Verificar dependências
- Instalar pacotes npm
- Criar estrutura de diretórios
- Construir imagem Docker
- Criar arquivo de exemplo

## 📁 Estrutura do Projeto

```
TCC_Experimento/
├── src/                    # Código gerado pelos LLMs
├── tests/                  # Testes Jest para validação
│   ├── crud-usuario.test.ts
│   └── setup.ts
├── docker/                 # Configuração Docker
│   ├── Dockerfile
│   └── analyze.sh
├── results/                # Relatórios de análise
│   ├── gpt5/
│   │   ├── crud/
│   │   ├── compra/
│   │   └── api/
│   └── claude/
│       ├── crud/
│       ├── compra/
│       └── api/
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── sonar-project.properties
├── docker-compose.yml
├── setup.ps1
└── run-analysis.ps1
```

## 🧪 Tarefas de Teste

### 1. CRUD de Usuário (Baixa Complexidade)
- Implementar endpoints: POST, GET, PUT, DELETE
- Modelo: `{ id, nome, email, senha, dataDeCriacao }`
- Validações de entrada e sanitização
- Testes: `tests/crud-usuario.test.ts`

### 2. Lógica de Compra (Média Complexidade)
- Processamento de pedidos
- Múltiplas entidades: Usuário, Produto, Pedido
- Regras de negócio complexas
- Validação de estoque e cálculos

### 3. Integração com API Externa (Alta Complexidade)
- Serviço de pagamento
- Integração com API de terceiros
- Tratamento de erros e timeouts
- Autenticação e segurança

## 🔬 Processo de Análise

### 1. Geração do Código
```powershell
# Copie o código gerado pelo LLM para src/
# Exemplo: src/app.ts, src/routes/, src/models/, etc.
```

### 2. Execução da Análise
```powershell
# Para GPT-5 - Tarefa CRUD
.\run-analysis.ps1 -Model gpt5 -Task crud

# Para Claude - Tarefa Compra
.\run-analysis.ps1 -Model claude -Task compra

# Com SonarQube (se configurado)
.\run-analysis.ps1 -Model gpt5 -Task crud -WithSonar
```

### 3. Análises Executadas

O script executa automaticamente:

1. **Compilação TypeScript**
   - Verificação de tipos
   - Detecção de erros de sintaxe

2. **Testes Jest**
   - Validação funcional
   - Cobertura de código
   - Relatório HTML em `results/jest/`

3. **Análise ESLint**
   - Padrões de código Google
   - Detecção de problemas
   - Relatórios JSON e HTML

4. **Análise Semgrep (SAST)**
   - Vulnerabilidades de segurança
   - Padrões perigosos
   - Relatórios JSON e SARIF

5. **Análise SonarQube**
   - Complexidade ciclomática
   - Índice de manutenibilidade
   - Code smells

## 📊 Relatórios Gerados

### Estrutura de Resultados
```
results/[model]/[task]/
├── jest/
│   ├── coverage/
│   └── test-results.xml
├── eslint/
│   ├── eslint-report.json
│   └── eslint-report.html
├── semgrep/
│   ├── semgrep-report.json
│   └── semgrep-report.sarif
├── sonar/
│   └── sonar-report.json
├── analysis-summary.md
└── analysis-metadata.json
```

### Métricas Coletadas

**Qualidade de Código:**
- Complexidade ciclomática
- Índice de manutenibilidade
- Número de code smells
- Cobertura de testes

**Segurança:**
- Vulnerabilidades por severidade
- Problemas de sanitização
- Uso de funções perigosas

**Performance:**
- Tempo de resposta dos endpoints
- Uso de memória
- Eficiência algorítmica

## 🔧 Comandos Úteis

```powershell
# Desenvolvimento local
npm run dev                 # Executar em modo desenvolvimento
npm test                   # Executar testes
npm run test:watch         # Testes em modo watch
npm run lint               # Análise ESLint
npm run lint:fix           # Corrigir problemas ESLint
npm run build              # Compilar TypeScript

# Docker
docker-compose up          # Subir ambiente completo
docker-compose up sonarqube # Apenas SonarQube local
docker build -t tcc-analyzer -f docker/Dockerfile .

# Análise manual
npx jest --coverage        # Testes com cobertura
npx eslint src/**/*.ts     # ESLint manual
semgrep --config=auto src/ # Semgrep manual
```

## ⚙️ Configuração do SonarQube

### Local (Docker)
```powershell
# Subir SonarQube local
docker-compose --profile sonar-local up -d sonarqube

# Acessar: http://localhost:9000
# Login: admin / admin
```

### Remoto
```powershell
# Definir variáveis de ambiente
$env:SONAR_HOST_URL = "https://sonarcloud.io"
$env:SONAR_TOKEN = "seu_token_aqui"

# Executar análise
.\run-analysis.ps1 -Model gpt5 -Task crud -WithSonar
```

## 🔍 Validação dos Testes

### Critérios de Sucesso
- ✅ Compilação TypeScript sem erros
- ✅ 100% dos testes Jest passando
- ✅ Ausência de vulnerabilidades críticas
- ✅ Conformidade com padrões ESLint

### Critérios de Falha
- ❌ Erros de compilação
- ❌ Testes falhando
- ❌ Vulnerabilidades de alta severidade
- ❌ Violações críticas de código

## 📈 Análise dos Resultados

Os dados coletados são utilizados para:
1. Comparação entre GPT-5 e Claude Sonnet 4
2. Avaliação por complexidade de tarefa
3. Identificação de padrões de qualidade
4. Métricas estatísticas comparativas

## 🤝 Contribuição

Este é um projeto de pesquisa acadêmica. Para dúvidas ou sugestões:
- Autor: Matheus Pesarini
- Orientador: [Nome do Orientador]
- Instituição: [Nome da Instituição]

## 📝 Licença

MIT License - Uso acadêmico e de pesquisa.
