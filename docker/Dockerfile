# Imagem base oficial do Node.js
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk update && apk add --no-cache \
    bash \
    git \
    openjdk11-jre \
    curl \
    python3 \
    py3-pip \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /app

# Instalar TypeScript globalmente
RUN npm install -g typescript@latest

# Instalar SonarQube Scanner
ENV SONAR_SCANNER_VERSION=5.0.1.3006
RUN curl -sSLo sonar-scanner.zip \
    https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip && \
    unzip sonar-scanner.zip && \
    mv sonar-scanner-${SONAR_SCANNER_VERSION}-linux /opt/sonar-scanner && \
    rm sonar-scanner.zip

# Adicionar SonarQube Scanner ao PATH
ENV PATH="/opt/sonar-scanner/bin:${PATH}"

# Instalar Semgrep
RUN pip3 install semgrep

# Criar diretórios para relatórios
RUN mkdir -p /app/results/sonar /app/results/eslint /app/results/semgrep /app/results/jest

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./
COPY .eslintrc.js ./
COPY sonar-project.properties ./

# Instalar dependências do projeto
RUN npm install

# Copiar scripts de análise
COPY docker/analyze.sh /usr/local/bin/analyze.sh
RUN chmod +x /usr/local/bin/analyze.sh

# Comando padrão
CMD ["analyze.sh"]
