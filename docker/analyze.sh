#!/bin/bash

# Script de análise completa do código
# Este script executa todas as ferramentas de análise no código TypeScript

set -e

echo "=== Iniciando Análise de Código ==="
echo "Timestamp: $(date)"
echo "======================================"

# Verificar se o código fonte existe
if [ ! -d "/app/src" ]; then
    echo "❌ Erro: Diretório /app/src não encontrado!"
    exit 1
fi

echo "📁 Código fonte encontrado em /app/src"

# 1. Compilação TypeScript
echo ""
echo "🔨 1. Compilando TypeScript..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Compilação TypeScript concluída com sucesso"
else
    echo "❌ Erro na compilação TypeScript"
    exit 1
fi

# 2. Executar testes Jest
echo ""
echo "🧪 2. Executando testes Jest..."
npm run test:coverage
if [ $? -eq 0 ]; then
    echo "✅ Testes Jest executados com sucesso"
    # Copiar relatório de cobertura
    if [ -d "coverage" ]; then
        cp -r coverage/* /app/results/jest/
        echo "📊 Relatório de cobertura copiado para /app/results/jest/"
    fi
else
    echo "❌ Falha nos testes Jest"
    # Continuar mesmo com falha nos testes para análise estática
fi

# 3. Análise ESLint
echo ""
echo "🔍 3. Executando análise ESLint..."
npm run lint -- --format=json --output-file=/app/results/eslint/eslint-report.json || true
npm run lint -- --format=html --output-file=/app/results/eslint/eslint-report.html || true
npm run lint || echo "⚠️  ESLint encontrou problemas (relatório gerado)"
echo "📊 Relatório ESLint salvo em /app/results/eslint/"

# 4. Análise Semgrep (SAST)
echo ""
echo "🛡️  4. Executando análise de segurança Semgrep..."
semgrep --config=auto \
    --json \
    --output=/app/results/semgrep/semgrep-report.json \
    /app/src/ || true

semgrep --config=auto \
    --sarif \
    --output=/app/results/semgrep/semgrep-report.sarif \
    /app/src/ || true

echo "📊 Relatório Semgrep salvo em /app/results/semgrep/"

# 5. Análise SonarQube
echo ""
echo "📈 5. Executando análise SonarQube..."
if [ -n "$SONAR_HOST_URL" ] && [ -n "$SONAR_TOKEN" ]; then
    sonar-scanner \
        -Dsonar.host.url=$SONAR_HOST_URL \
        -Dsonar.login=$SONAR_TOKEN \
        -Dsonar.projectKey=tcc-experimento \
        -Dsonar.sources=src \
        -Dsonar.tests=tests \
        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
    echo "✅ Análise SonarQube enviada para o servidor"
else
    echo "⚠️  Variáveis SonarQube não configuradas. Executando análise local..."
    sonar-scanner \
        -Dsonar.projectKey=tcc-experimento \
        -Dsonar.sources=src \
        -Dsonar.tests=tests \
        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
        -Dsonar.scanner.dumpToFile=/app/results/sonar/sonar-report.json || true
fi

# 6. Gerar resumo da análise
echo ""
echo "📋 6. Gerando resumo da análise..."

# Criar arquivo de resumo
cat > /app/results/analysis-summary.md << EOF
# Resumo da Análise de Código

**Data/Hora:** $(date)
**Projeto:** TCC Experimento - Análise LLM

## Ferramentas Executadas

### ✅ Compilação TypeScript
- Status: Concluída
- Arquivos compilados disponíveis em \`dist/\`

### 🧪 Testes Jest
- Relatórios disponíveis em \`results/jest/\`
- Cobertura de código: Verificar \`results/jest/index.html\`

### 🔍 ESLint
- Relatório JSON: \`results/eslint/eslint-report.json\`
- Relatório HTML: \`results/eslint/eslint-report.html\`

### 🛡️ Semgrep (SAST)
- Relatório JSON: \`results/semgrep/semgrep-report.json\`
- Relatório SARIF: \`results/semgrep/semgrep-report.sarif\`

### 📈 SonarQube
- Configuração: \`sonar-project.properties\`
- Dados enviados para análise (se configurado)

## Estrutura de Resultados

\`\`\`
results/
├── jest/           # Relatórios de teste e cobertura
├── eslint/         # Relatórios de análise estática
├── semgrep/        # Relatórios de segurança
├── sonar/          # Dados SonarQube (se aplicável)
└── analysis-summary.md
\`\`\`

## Próximos Passos

1. Revisar os relatórios gerados
2. Analisar métricas de qualidade
3. Verificar vulnerabilidades de segurança
4. Compilar dados para análise estatística

EOF

echo "✅ Resumo salvo em /app/results/analysis-summary.md"

# 7. Listar arquivos gerados
echo ""
echo "📁 Arquivos gerados:"
find /app/results -type f -name "*.json" -o -name "*.html" -o -name "*.xml" -o -name "*.sarif" -o -name "*.md" | sort

echo ""
echo "🎉 Análise completa!"
echo "======================================"
