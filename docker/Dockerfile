FROM alpine:3.22

ENV NODE_VERSION 22.18.0

RUN apk add --no-cache curl python3 py3-pip gnupg

RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o node.tar.xz \
    && tar -xf node.tar.xz \
    && mv "node-v${NODE_VERSION}-linux-x64" /usr/local/lib/node \
    && rm node.tar.xz \
    && ln -s /usr/local/lib/node/bin/node /usr/local/bin/node \
    && ln -s /usr/local/lib/node/bin/npm /usr/local/bin/npm \
    && ln -s /usr/local/lib/node/bin/npx /usr/local/bin/npx

# Instala as ferramentas globais de análise (Semgrep e SonarQube Scanner)
RUN pip3 install semgrep
RUN npm install -g sonarqube-scanner

# Instala o k6
# (O processo de instalação do k6 no Alpine é um pouco diferente)
RUN apk add --no-cache k6

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Comando padrão para manter o container rodando para acesso interativo
CMD ["/bin/bash"]