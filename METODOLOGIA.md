\chapter{Metodologia}
\label{cap_exemplos}

Este capítulo detalha os procedimentos metodológicos adotados para conduzir a pesquisa. Ele descreve como o estudo será feito, o ambiente onde os experimentos foram realizados, as tarefas implementadas, o protocolo para execução e coleta de dados, e, por fim, a estratégia para a análise dos resultados.

% ---
\section{Condução da Pesquisa}
\label{delineamento_pesquisa}
% ---

Este trabalho caracteriza-se como um estudo empírico de natureza comparativa, com uma abordagem de métodos mistos. A pesquisa combina a coleta de dados quantitativos, por meio de métricas de software, com a coleta de dados qualitativos, obtidos por meio de observações sistemáticas do processo de desenvolvimento.

% ---
\section{Definição do Ambiente de Estudo}
\label{definicao_objeto}
% ---

Para garantir a validade e a possibilidade de replicação do estudo, o ambiente experimental foi rigorosamente definido e padronizado. As tecnologias e ferramentas utilizadas estão listadas abaixo: 

\begin{itemize}
    \item \textbf{Modelos de LLM:} Foram selecionados os modelos OpenAI GPT-5 e Claude Sonnet 4, ambos acessados através do Github Copilot Chat.
    \item \textbf{Ambiente de Desenvolvimento:} Será usado o TypeScript na versão 5.8.2, Node.js na versão 20.17.1.
    \begin{itemize}
        \item \textbf{Framework:} Express na versão 5.1.0, um framework rápido para Node.js, utilizado na criação de rotas da API.
        \item \textbf{SonarQube (versão):} Utilizado para a coleta de métricas de qualidade do código, como Complexidade Ciclomática, Índice de Manutenibilidade e identificação de Code Smells.
        \item \textbf{ESLint (versão 9.5.0):} Empregado para análise estática e verificação de conformidade com padrões de código, utilizando o conjunto de regras recomendado pela Google (VERIFICAR).
    \end{itemize}
\end{itemize}

% ---
\subsection{Isolamento do Ambiente e Padronização dos Testes}
\label{isolamento_ambiente}
% ---

Para garantir que os testes sejam reproduzíveis e sem interferência externa do sistema, todo o processo de análise de código foi executado dentro de um ambiente isolado utilizando Docker. Essa abordagem assegura que as versões de Node.js, TypeScript, bibliotecas e ferramentas de análise sejam idênticas em todas as execuções. 

\begin{itemize}
    \item Foi Criada uma imagem base contendo:
    \begin{itemize}
        \item Node.js 20.17.1
        \item TypeScript 5.8.2
        \item Express 5.1.0
        \item Jest (DEFINIR VERSAO)
        \item ESLint (DEFINIR VERSAO)
        \item SonarQube Scanner
        \item Ferramenta de SAST selecionada
        \item k6 para testes de carga
    \end{itemize}
\end{itemize}

A execução dos experimentos foi feita nas seguintes etapas:

\begin{itemize}
    \item A execução dos experimentos foi feita nas seguintes etapas:
    \begin{enumerate}
        \item Build da imagem Docker.
        \item Montagem do diretório contendo os códigos gerados pelo LLM como volume.
        \item Execução dos testes e análises dentro do container.
        \item Exportação dos relatórios (SonarQube, ESLint, SAST, Jest) para um diretório de resultados.
    \end{enumerate}
\end{itemize}

\begin{itemize}
    \item Exemplo do comando usado para criar o ambiente:
    \item TRECHO DO DOCKERFILE
\end{itemize}

% ---
\subsection{Padronização dos Prompts}
\label{padronizacao_prompts}
% ---

Um dos principais problemas ao avaliar a geração de código por LLMs é a variabilidade das respostas em função de como foi escrito o prompt. Pequenas alterações no prompt podem levar a diferenças significativas na resposta como a qualidade e estrutura do código gerado. Para evitar que isso aconteça, nesta tese foi adotada uma estratégia de padronizar os prompts, garantindo consistência no processo de coleta dos resultados.

Foi criado um template de prompt estruturado, baseado nas melhores práticas de engenharia de prompt discutidas no Capítulo 2. O template foi preenchido para cada uma das três tarefas e continha os seguintes componentes:

\begin{itemize}
    \item \textbf{Descrição clara da tarefa:} "Implemente um CRUD de usuário em Node.js utilizando TypeScript e Express, incluindo operações de criação, leitura, atualização e exclusão"
    \item \textbf{Requisitos técnicos explícitos:} especifição do TypeScript, do framework Express, e a versão do Node.js usada e boas práticas como não utilizar "any", aplicar tipagem forte e seguir \textit{Clean Code}.
    \item \textbf{Formato esperado da resposta:} definição da estrutura de pastas e arquivos, assinatura de funções e uso de testes unitários.
    \item \textbf{Restrições:} evitar outras bibliotecas não mencionadas, priorizar clareza e modularização do código.
\end{itemize}

Cada geração foi limitada a três prompts adicionais para evitar interação excessiva. Caso, após esse limite, o código não atendesse aos critérios funcionais mínimos (testes unitários), a geração foi considerada falha para aquela tarefa.

Essa padronização contribui para a reprodutibilidade dos testes, uma vez que garante que as diferenças observadas entre os códigos gerados possam ser atribuídas ao comportamento dos modelos de linguagem, e não à variação na formulação dos prompts.

% ---
\section{Definição das Tarefas Experimentais}
\label{definicao_tarefas}
% ---

Foram definidas três tarefas de desenvolvimento backend com níveis de complexidade distintos para avaliar os modelos em diferentes cenários. As tarefas são: 

\begin{enumerate}
    \item \textbf{CRUD de Usuário (Baixa Complexidade):} Implementação de um conjunto de endpoints da API para Criar, Ler, Atualizar e Deletar um recurso de usuário, sendo considerado uma baixa complexidade. O modelo de dados do usuário deve conter os campos: id, nome, email, senha e dataDeCriacao.
    
    \item \textbf{Lógica de Compra (Média Complexidade):} Desenvolvimento de um serviço para processar um pedido de compra, envolvendo múltiplas entidades (Usuário, Produto, Pedido). As regras de negócio incluem verificar a situação da conta do usuário, validar a disponibilidade de estoque para cada produto no carrinho e calcular o valor total do pedido.

    \item \textbf{Integração com API Externa (Alta Complexidade):} Criação de um serviço para processar pagamentos que se integra a uma API de terceiros. DECIDIR API EXTERNA.
\end{enumerate}

% ---
\section{Procedimento da Coleta de Dados}
\label{coleta_dados}
% ---

A coleta de dados foi aplicado de forma idêntica para as três tarefas, sendo executado independentemente para o GPT-5 e o Claude Sonnet 4. O procedimento foi divido nas seguintes fases:

\begin{enumerate}
    \item \textbf{Preparação:} Antes da geração do código, foi desenvolvida uma suíte de testes unitários e de integração utilizando o framework Jest para cada tarefa. Esta suíte serve para verificar se o código gerado está funcional.
    \item \textbf{Execução:} Para cada modelo, foi inserido o prompt para gerar o código da tarefa. Durante este processo, foram coletados dados qualitativos como o número de prompts, os tipos de erros cometidos pelo modelo e a clareza das soluções propostas. O tempo total da interação. A geração do código foi considerada como sucesso caso a solução tenha passado 100\% dos testes predefinidos, caso não passe, será permitido o re-prompt.
    \item \textbf{Análise Pós-Execução:} Com o código final e funcional, foram executadas as ferramentas de análise para a coleta dos dados quantitativos:
    \begin{itemize}
        \item \textbf{Análise de Qualidade Estática:} O Código foi analisado pelo SonarQube para extrair as métricas de Complexidade Ciclomática, Índice de Manutenibilidade e número de \textit{Code Smells}.
        \item \textbf{Análise de Segurança:} Foi utilizada ferramenta de SAST (\textit{Static Application Security Testing)} para identificar vulnerabilidades de segurança.
        \item \textbf{Análise de Performance:} Foram executados testes de carga (usando k6) nos endpoints da API para medir métricas de desempenho como requisições por segundo e latência média. (DETALHAR TEMPO TOTAL DE EXEC E USUARIOS)
    \end{itemize}
\end{enumerate}

% ---
\subsection{Critérios de Avaliação de Segurança}
\label{criterios_seguranca}
% ---

A análise de segurança via SAST considerou vulnerabilidades de alta, média e baixa severidade, conforme classificação OWASP. Entre os problemas verificados:
\begin{itemize}
    \item Injeção de código (SQL Injection, Command Injection).
    \item Cross-Site Scripting (XSS).
    \item Uso de funções perigosas (eval, exec).
    \item Falta de sanitização e validação de entradas.
\end{itemize}

% ---
\section{Procedimento da Análise dos Dados}
\label{analise_dados}

A análise dos dados coletados seguiu uma abordagem mista de métodos, combinando os dados quantitativos e qualitativos para fornecer uma visão completa.

\begin{itemize}
    \item \textbf{Análise Quantitativa:} Os dados numéricos coletados (métricas do SonarQube, resultados de performance, contagem de vulnerabilidades, tempo de geração de código, etc.) foram organizados em tabelas e gráficos comparativos. O objetivo foi identificar diferenças estatisticamente significativas e padrões de desempenho entre o GPT-5 e o Claude Sonnet 4 em cada tarefa.
    \item \textbf{Análise Qualitativa:} O código gerado foi submetido a uma análise para observações de pontos fortes e fracos do que foi gerado, como os requisitos que foram ou não cumpridos e os erros gerados.
    \item \textbf{Síntese dos Resultados:} No final, as análises quantitativas e qualitativas serão reunidas para responder às perguntas da tese. Por exemplo, foi analisado se o modelo que gerou o código com o melhor resultado de manutenibilidade foi também aquele que exigiu menos intervenções para correção de lógica, permitindo uma conclusão mais rica e aprofundada sobre o "melhor" modelo para cada contexto.
\end{itemize}
% ---

% ---
\subsection{Critérios para Análise Qualitativa}
\label{criterio_analise_qualitativa}
% ---

Durante a análise qualitativa, os códigos foram avaliados manualmente em:

\begin{itemize}
    \item Clareza de nomes de variáveis e funções.
    \item Modularização e organização do projeto.
    \item Uso das funcionalidades do TypeScript
    \item Presença de comentários e documentação mínima. 
\end{itemize}