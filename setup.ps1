# Script PowerShell para configuração inicial do ambiente de testes
# Uso: .\setup.ps1

Write-Host "🚀 Configurando ambiente de testes para TCC..." -ForegroundColor Yellow

# Verificar se Node.js está instalado
Write-Host "📦 Verificando Node.js..." -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    
    # Verificar versão mínima
    $version = $nodeVersion -replace 'v', ''
    $major = [int]($version.Split('.')[0])
    if ($major -lt 20) {
        Write-Host "⚠️  Versão do Node.js é $nodeVersion. Recomendado: v20.17.1 ou superior" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js 20.17.1 ou superior." -ForegroundColor Red
    exit 1
}

# Verificar se Docker está disponível
Write-Host "🐳 Verificando Docker..." -ForegroundColor Blue
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado. Instale Docker Desktop." -ForegroundColor Red
    exit 1
}

# Instalar dependências do projeto
Write-Host "📥 Instalando dependências do projeto..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependências instaladas com sucesso" -ForegroundColor Green

# Criar estrutura de diretórios para resultados
Write-Host "📁 Criando estrutura de diretórios..." -ForegroundColor Blue

$directories = @(
    "results",
    "results\gpt5\crud",
    "results\gpt5\compra", 
    "results\gpt5\api",
    "results\claude\crud",
    "results\claude\compra",
    "results\claude\api",
    "src\generated"
)

foreach ($dir in $directories) {
    $fullPath = Join-Path $PSScriptRoot $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Force -Path $fullPath | Out-Null
        Write-Host "  📂 Criado: $dir" -ForegroundColor Cyan
    }
}

# Construir imagem Docker base
Write-Host "🔨 Construindo imagem Docker base..." -ForegroundColor Blue

# Usar versão mínima que funciona
Write-Host "   Usando Dockerfile.minimal (versão estável)..." -ForegroundColor Cyan
docker build -t tcc-analyzer -f docker/Dockerfile.minimal .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Imagem Docker construída com sucesso" -ForegroundColor Green
    
    # Testar imagem
    $nodeVersion = docker run --rm tcc-analyzer node --version
    Write-Host "   Node.js: $nodeVersion" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro ao construir imagem Docker" -ForegroundColor Red
    Write-Host "   Tente executar: .\diagnose.ps1" -ForegroundColor Yellow
    exit 1
}

# Verificar TypeScript
Write-Host "🔧 Verificando TypeScript..." -ForegroundColor Blue
try {
    $tscVersion = npx tsc --version
    Write-Host "✅ TypeScript: $tscVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erro ao verificar TypeScript" -ForegroundColor Yellow
}

# Criar arquivo de exemplo para testar
Write-Host "📝 Criando arquivo de exemplo..." -ForegroundColor Blue

$exampleContent = @"
import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API do TCC - Ambiente de Testes' });
});

export default app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
  });
}
"@

$exampleContent | Out-File -FilePath "src\app.ts" -Encoding UTF8

# Testar compilação
Write-Host "🧪 Testando compilação TypeScript..." -ForegroundColor Blue
npx tsc --noEmit

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilação TypeScript bem-sucedida" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aviso na compilação TypeScript (normal para código de exemplo)" -ForegroundColor Yellow
}

# Exibir instruções finais
Write-Host ""
Write-Host "🎉 Setup concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Gere o código usando GPT-5 ou Claude Sonnet 4" -ForegroundColor White
Write-Host "2. Salve o código gerado em src/" -ForegroundColor White
Write-Host "3. Execute a análise: .\run-analysis.ps1 -Model gpt5 -Task crud" -ForegroundColor White
Write-Host ""
Write-Host "📁 Estrutura criada:" -ForegroundColor Cyan
Write-Host "  src/          - Código gerado pelos LLMs" -ForegroundColor White
Write-Host "  tests/        - Testes Jest para validação" -ForegroundColor White
Write-Host "  results/      - Relatórios de análise" -ForegroundColor White
Write-Host "  docker/       - Configuração Docker" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  npm test              - Executar testes" -ForegroundColor White
Write-Host "  npm run lint          - Análise ESLint" -ForegroundColor White
Write-Host "  npm run build         - Compilar TypeScript" -ForegroundColor White
Write-Host "  .\run-analysis.ps1    - Análise completa no Docker" -ForegroundColor White
