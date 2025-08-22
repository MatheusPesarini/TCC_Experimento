#!/usr/bin/env bash
set -euo pipefail

echo "[1/4] Instalar dependências (npm ci)"
if [ -f package-lock.json ]; then npm ci; else npm install; fi

echo "[2/4] Rodar testes (Jest) com cobertura"
npm test -- --coverage

echo "[3/4] Rodar Semgrep"
mkdir -p results
semgrep --config .semgrep.yml --error --json > results/semgrep.json || true

echo "[4/4] Rodar SonarScanner (usa sonar-project.properties)"
if [ -z "${SONAR_HOST_URL:-}" ] || [ -z "${SONAR_TOKEN:-}" ]; then
  echo "Aviso: SONAR_HOST_URL ou SONAR_TOKEN não definidos; pulando upload ao SonarQube." >&2
else
  sonar-scanner \
    -Dsonar.host.url=${SONAR_HOST_URL} \
    -Dsonar.login=${SONAR_TOKEN}
fi

echo "Concluído. Cobertura em coverage/lcov.info, Semgrep em results/semgrep.json."
