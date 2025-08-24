### 1 - Jest e Supertest
```bash
npm test -- --coverage
```

### 2 - Semgrep
```bash
cd caminho/para/a/pasta/principal/Claude4/task2
semgrep scan --config auto src --no-git
```

### 3 - SonarQube
```bash
npm test -- --coverage
$env:SONAR_TOKEN="sqa_eeec9d466a5019b700c593eebecd39a45e6b29e6"
sonar-scanner.bat   
```


### 4 - K6