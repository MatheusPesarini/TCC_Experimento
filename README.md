# TCC Experimento - Ambiente de Teste

Dois backends TypeScript (gpt5 e claude4) com CRUD de usuários em memória, testados por Jest e analisados com Semgrep e SonarScanner.

## Instalação

```pwsh
pnpm i || npm i || yarn
```

## Rodar testes

```pwsh
npm test
# ou por projeto
npm run test:gpt5
npm run test:claude4
```

Relatório de cobertura: `coverage/lcov.info`.

## Subir APIs (opcional, para k6 local)

```pwsh
npm run start:gpt5  # porta 3001
npm run start:claude4 # porta 3002
```

## Análise com Docker (Semgrep e Sonar)

```pwsh
docker build -t tcc_analyzer -f docker/Dockerfile .
docker run --rm -it -v ${PWD}:/app tcc_analyzer bash

# dentro do container
npm ci
npm test -- --coverage
semgrep --config .semgrep.yml --error || true
sonar-scanner -Dsonar.host.url=${Env:SONAR_HOST_URL} -Dsonar.login=${Env:SONAR_TOKEN}
```
# TCC_Experimento
Experimento para minha tese de conclusão de curso
