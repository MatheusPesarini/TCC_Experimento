# Script para validar o ambiente de testes
# Uso: .\validate-environment.ps1

Write-Host "🔍 Validando ambiente de testes..." -ForegroundColor Yellow

$errors = @()
$warnings = @()

# Verificar Node.js
try {
    $nodeVersion = node --version
    $version = $nodeVersion -replace 'v', ''
    $major = [int]($version.Split('.')[0])
    
    if ($major -ge 20) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        $warnings += "Node.js versão $nodeVersion (recomendado: v20+)"
    }
} catch {
    $errors += "Node.js não encontrado"
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
} catch {
    $errors += "npm não encontrado"
}

# Verificar Docker
try {
    docker info | Out-Null
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    $errors += "Docker não está rodando"
}

# Verificar arquivos de configuração
$configFiles = @(
    "package.json",
    "tsconfig.json", 
    "jest.config.js",
    ".eslintrc.js",
    "sonar-project.properties",
    "docker/Dockerfile",
    "docker/analyze.sh"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        $errors += "Arquivo $file não encontrado"
    }
}

# Verificar diretórios
$directories = @(
    "src",
    "tests", 
    "docker",
    "results"
)

foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "✅ Diretório $dir/" -ForegroundColor Green
    } else {
        $errors += "Diretório $dir/ não encontrado"
    }
}

# Verificar dependências npm
if (Test-Path "node_modules") {
    Write-Host "✅ Dependências npm instaladas" -ForegroundColor Green
} else {
    $warnings += "Dependências npm não instaladas (execute: npm install)"
}

# Verificar se imagem Docker existe
try {
    docker image inspect tcc-analyzer | Out-Null
    Write-Host "✅ Imagem Docker tcc-analyzer" -ForegroundColor Green
} catch {
    $warnings += "Imagem Docker não construída (execute: docker build -t tcc-analyzer -f docker/Dockerfile .)"
}

# Testar compilação TypeScript
if (Test-Path "src/app.ts") {
    try {
        npx tsc --noEmit | Out-Null
        Write-Host "✅ Compilação TypeScript" -ForegroundColor Green
    } catch {
        $warnings += "Problemas na compilação TypeScript"
    }
}

# Resultados
Write-Host ""
if ($errors.Count -eq 0) {
    Write-Host "🎉 Ambiente válido!" -ForegroundColor Green
} else {
    Write-Host "❌ Problemas encontrados:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  • $error" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Avisos:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  • $warning" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📊 Resumo da validação:" -ForegroundColor Cyan
Write-Host "  Erros: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  Avisos: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -eq 0) { "Green" } else { "Yellow" })

if ($errors.Count -eq 0) {
    exit 0
} else {
    exit 1
}
