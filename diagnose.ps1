# Script de diagnóstico rápido para problemas Docker
# Uso: .\diagnose.ps1

Write-Host "🔍 Diagnóstico do ambiente Docker..." -ForegroundColor Yellow

# 1. Verificar Docker Desktop
Write-Host "`n1. Docker Desktop:" -ForegroundColor Cyan
try {
    $dockerInfo = docker info --format "{{.ServerVersion}}"
    Write-Host "   ✅ Versão: $dockerInfo" -ForegroundColor Green
    
    $dockerStatus = docker system df --format "table {{.Type}}\t{{.Total}}\t{{.Active}}"
    Write-Host "   📊 Status do sistema:" -ForegroundColor Cyan
    $dockerStatus | Write-Host -ForegroundColor White
} catch {
    Write-Host "   ❌ Docker não está rodando" -ForegroundColor Red
    Write-Host "   💡 Solução: Inicie o Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar conectividade de rede
Write-Host "`n2. Conectividade de rede:" -ForegroundColor Cyan
try {
    $ping = Test-NetConnection -ComputerName "registry-1.docker.io" -Port 443 -WarningAction SilentlyContinue
    if ($ping.TcpTestSucceeded) {
        Write-Host "   ✅ Docker Hub acessível" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Docker Hub inacessível" -ForegroundColor Yellow
        Write-Host "   💡 Verifique firewall/proxy corporativo" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Não foi possível testar conectividade" -ForegroundColor Yellow
}

# 3. Verificar espaço em disco
Write-Host "`n3. Espaço em disco:" -ForegroundColor Cyan
try {
    $drive = Get-PSDrive C
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    if ($freeSpaceGB -gt 5) {
        Write-Host "   ✅ Espaço livre: ${freeSpaceGB}GB" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Pouco espaço livre: ${freeSpaceGB}GB" -ForegroundColor Yellow
        Write-Host "   💡 Libere pelo menos 5GB para Docker" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Não foi possível verificar espaço em disco" -ForegroundColor Yellow
}

# 4. Verificar imagens Node.js disponíveis
Write-Host "`n4. Imagens Node.js:" -ForegroundColor Cyan
$nodeImages = @("node:lts-alpine", "node:20-alpine", "node:18-alpine")
foreach ($image in $nodeImages) {
    try {
        docker image inspect $image | Out-Null
        Write-Host "   ✅ $image (local)" -ForegroundColor Green
    } catch {
        Write-Host "   ⏳ $image (precisa baixar)" -ForegroundColor Yellow
    }
}

# 5. Verificar arquivos de configuração
Write-Host "`n5. Arquivos de configuração:" -ForegroundColor Cyan
$files = @(
    "docker/Dockerfile",
    "docker/Dockerfile.simple", 
    "docker/analyze.sh",
    "package.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "   ✅ $file (${size} bytes)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (não encontrado)" -ForegroundColor Red
    }
}

# 6. Sugestões de solução
Write-Host "`n💡 Soluções recomendadas:" -ForegroundColor Yellow
Write-Host "   1. Se Docker Hub inacessível:" -ForegroundColor White
Write-Host "      - Verifique conexão com internet" -ForegroundColor Gray
Write-Host "      - Configure proxy se necessário" -ForegroundColor Gray
Write-Host "      - Use: docker pull node:lts-alpine" -ForegroundColor Gray

Write-Host "   2. Para construir imagem:" -ForegroundColor White
Write-Host "      - Use: .\test-docker.ps1" -ForegroundColor Gray
Write-Host "      - Ou: docker build -t tcc-analyzer -f docker/Dockerfile.simple ." -ForegroundColor Gray

Write-Host "   3. Se persistir o erro:" -ForegroundColor White
Write-Host "      - Reinicie Docker Desktop" -ForegroundColor Gray
Write-Host "      - Execute: docker system prune" -ForegroundColor Gray
Write-Host "      - Verifique configurações de rede" -ForegroundColor Gray

Write-Host "`n🎯 Próximo passo: Execute .\test-docker.ps1" -ForegroundColor Cyan
