# Script PowerShell para executar análise de código
# Uso: .\run-analysis.ps1 [-Model "gpt5|claude"] [-Task "crud|compra|api"]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("gpt5", "claude")]
    [string]$Model,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("crud", "compra", "api")]
    [string]$Task,
    
    [switch]$WithSonar
)

# Verificar se Docker está rodando
Write-Host "🐳 Verificando Docker..." -ForegroundColor Blue
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Inicie o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Definir diretórios
$projectRoot = $PSScriptRoot
$resultsDir = "$projectRoot\results\$Model\$Task"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Criar diretório de resultados
New-Item -ItemType Directory -Force -Path $resultsDir | Out-Null
Write-Host "📁 Resultados serão salvos em: $resultsDir" -ForegroundColor Cyan

# Verificar se existe código fonte
$srcDir = "$projectRoot\src"
if (-not (Test-Path $srcDir)) {
    Write-Host "❌ Diretório src/ não encontrado. Certifique-se de que o código foi gerado." -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Iniciando análise para $Model - Tarefa: $Task" -ForegroundColor Yellow

# Construir/verificar imagem Docker
Write-Host "🔨 Verificando imagem Docker..." -ForegroundColor Blue

# Verificar se imagem existe
try {
    docker image inspect tcc-analyzer | Out-Null
    Write-Host "✅ Imagem tcc-analyzer encontrada" -ForegroundColor Green
} catch {
    Write-Host "🔨 Construindo imagem Docker..." -ForegroundColor Blue
    docker build -t tcc-analyzer -f docker/Dockerfile.minimal .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao construir imagem Docker" -ForegroundColor Red
        Write-Host "   Tente executar: .\setup.ps1" -ForegroundColor Yellow
        exit 1
    }
}

# Configurar variáveis de ambiente para SonarQube
$envVars = @()
if ($WithSonar -and $env:SONAR_HOST_URL) {
    $envVars += "-e", "SONAR_HOST_URL=$env:SONAR_HOST_URL"
    $envVars += "-e", "SONAR_TOKEN=$env:SONAR_TOKEN"
    Write-Host "🔧 Configuração SonarQube detectada" -ForegroundColor Cyan
}

# Executar análise
Write-Host "⚡ Executando análise..." -ForegroundColor Blue
$dockerArgs = @(
    "run", "--rm"
    "-v", "${projectRoot}/src:/app/src:ro"
    "-v", "${projectRoot}/tests:/app/tests:ro"
    "-v", "${resultsDir}:/app/results"
) + $envVars + @("tcc-analyzer", "bash", "/usr/local/bin/analyze.sh")

& docker @dockerArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Análise concluída com sucesso!" -ForegroundColor Green
    
    # Criar arquivo de metadados
    $metadata = @{
        model = $Model
        task = $Task
        timestamp = $timestamp
        analysis_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        environment = @{
            os = $env:OS
            powershell_version = $PSVersionTable.PSVersion.ToString()
            docker_version = (docker --version)
        }
    } | ConvertTo-Json -Depth 3
    
    $metadata | Out-File -FilePath "$resultsDir\analysis-metadata.json" -Encoding UTF8
    
    Write-Host "📊 Resultados disponíveis em: $resultsDir" -ForegroundColor Cyan
    Write-Host "📋 Resumo da análise: $resultsDir\analysis-summary.md" -ForegroundColor Cyan
    
    # Abrir diretório de resultados
    if (Get-Command "explorer" -ErrorAction SilentlyContinue) {
        explorer $resultsDir
    }
} else {
    Write-Host "❌ Erro durante a análise" -ForegroundColor Red
    exit 1
}
