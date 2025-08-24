### 1 - Jest e Supertest
```bash
npm test -- --coverage
```

### 3 - SonarQube
```bash
npm test -- --coverage
sonar-scanner.bat   
sonar-scanner `
  -D"sonar.projectKey=claude4-task1" `
  -D"sonar.host.url=http://localhost:9000" `
  -D"sonar.login=$env:SONAR_TOKEN"
```


### 4 - K6