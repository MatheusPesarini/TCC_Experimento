### 1 - Jest e Supertest
```bash
npm test -- --coverage
```

### 2 - SonarQube
```bash
sonar-scanner `
  -D"sonar.projectKey=claude4-task1" `
  -D"sonar.host.url=http://localhost:9000" `
  -D"sonar.login=$env:SONAR_TOKEN"

sonar-scanner `
  -D"sonar.projectKey=gpt-5-task1" `
  -D"sonar.host.url=http://localhost:9000" `
  -D"sonar.login=$env:SONAR_TOKEN"
```

### 3 - CodeQL

* Github

### 4 - K6

1. Build e subir a API

```powershell
cd Claude4/task1
npm run build
npm start
```

2. Rodar o k6 (novo script já envia senha e permite BASE_URL por env)

```powershell
k6 run -e BASE_URL=http://localhost:3000 .\script.js
```
