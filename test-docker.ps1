# Script PowerShell para testar e corrigir problemas do Docker
# Uso: .\test-docker.ps1

Write-Host "🐳 Testando configuração Docker..." -ForegroundColor Yellow

# Verificar se Docker está rodando
Write-Host "1. Verificando se Docker está rodando..." -ForegroundColor Blue
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Inicie o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Testar conectividade com Docker Hub
Write-Host "2. Testando conectividade com Docker Hub..." -ForegroundColor Blue
try {
    docker pull hello-world:latest | Out-Null
    Write-Host "✅ Conectividade com Docker Hub OK" -ForegroundColor Green
    docker rmi hello-world:latest | Out-Null
} catch {
    Write-Host "⚠️  Problema de conectividade com Docker Hub" -ForegroundColor Yellow
    Write-Host "   Tentando usar cache local..." -ForegroundColor Cyan
}

# Listar imagens Node.js disponíveis localmente
Write-Host "3. Verificando imagens Node.js disponíveis..." -ForegroundColor Blue
$nodeImages = docker images --filter=reference="node" --format "table {{.Repository}}:{{.Tag}}"
if ($nodeImages) {
    Write-Host "✅ Imagens Node.js encontradas localmente:" -ForegroundColor Green
    $nodeImages | Write-Host
} else {
    Write-Host "⚠️  Nenhuma imagem Node.js encontrada localmente" -ForegroundColor Yellow
}

# Tentar baixar imagem Node.js
Write-Host "4. Baixando imagem Node.js..." -ForegroundColor Blue
try {
    Write-Host "   Tentando node:20-alpine..." -ForegroundColor Cyan
    docker pull node:20-alpine
    Write-Host "✅ Imagem node:20-alpine baixada com sucesso" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erro ao baixar node:20-alpine" -ForegroundColor Yellow
    
    # Tentar versão alternativa
    try {
        Write-Host "   Tentando node:lts-alpine..." -ForegroundColor Cyan
        docker pull node:lts-alpine
        Write-Host "✅ Imagem node:lts-alpine baixada com sucesso" -ForegroundColor Green
        
        # Atualizar Dockerfile para usar LTS
        Write-Host "   Atualizando Dockerfile para usar node:lts-alpine..." -ForegroundColor Cyan
        $dockerfilePath = "docker\Dockerfile"
        $dockerfileContent = Get-Content $dockerfilePath -Raw
        $dockerfileContent = $dockerfileContent -replace "FROM node:20-alpine", "FROM node:lts-alpine"
        $dockerfileContent | Set-Content $dockerfilePath
        Write-Host "✅ Dockerfile atualizado" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Erro ao baixar imagens Node.js" -ForegroundColor Red
        Write-Host "   Verifique sua conexão com a internet" -ForegroundColor Red
        exit 1
    }
}

# Construir imagem de teste
Write-Host "5. Construindo imagem Docker..." -ForegroundColor Blue
try {
    Write-Host "   Tentando Dockerfile principal..." -ForegroundColor Cyan
    docker build -t tcc-analyzer -f docker/Dockerfile .
    Write-Host "✅ Imagem Docker construída com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erro com Dockerfile principal, tentando versão simplificada..." -ForegroundColor Yellow
    try {
        docker build -t tcc-analyzer -f docker/Dockerfile.simple .
        Write-Host "✅ Imagem Docker (versão simplificada) construída com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao construir imagem Docker" -ForegroundColor Red
        Write-Host "   Verifique os logs acima para mais detalhes" -ForegroundColor Red
        exit 1
    }
}

# Testar imagem
Write-Host "6. Testando imagem construída..." -ForegroundColor Blue
try {
    $testResult = docker run --rm tcc-analyzer node --version
    Write-Host "✅ Imagem funcionando. Node.js versão: $testResult" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Problema ao testar imagem" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Teste Docker concluído!" -ForegroundColor Green
Write-Host "✅ Ambiente Docker está pronto para uso" -ForegroundColor Green
