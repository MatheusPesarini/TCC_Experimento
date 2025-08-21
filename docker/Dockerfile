FROM node:lts-alpine

# Versões fixadas
ARG SONAR_SCANNER_VERSION=5.0.1.3006

# Instala dependências extras
RUN apk add --no-cache bash python3 py3-pip curl git wget unzip ca-certificates openjdk17-jre-headless

# Evita reclamações do pip e permite instalar no sistema (PEP 668)
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_BREAK_SYSTEM_PACKAGES=1

# Semgrep (pode fixar versão)
RUN pip install --no-cache-dir semgrep

# Sonar Scanner (usa diretório específico, evita wildcard ambíguo)
RUN wget -q https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip \
    && unzip -q sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip \
    && mv sonar-scanner-${SONAR_SCANNER_VERSION}-linux /opt/sonar-scanner \
    && rm sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip \
    && ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk \
    PATH=/opt/sonar-scanner/bin:$JAVA_HOME/bin:$PATH \
    SONAR_SCANNER_OPTS="-server"

WORKDIR /app

CMD ["bash", "-c", "sleep infinity"]