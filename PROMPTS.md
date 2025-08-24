### Task 1

------------------------------------------------------------------------

Objetivo
Implemente um CRUD de usuário em Node.js usando TypeScript e Express 5.1.0. O código deve rodar e passar 100% dos testes do arquivo:
c:\Users\mathe\Área de Trabalho\TCC_Experimento\Claude4\task1\task1.test.ts
(Não altere o teste.)

Ambiente/Versões
- Node.js 22.18.0 LTS
- TypeScript 5.9.2 (strict)
- Express 5.1.0
- Testes: Vitest + Supertest (já configurados)

Requisitos funcionais
- Endpoints: POST /usuarios, GET /usuarios, GET /usuarios/:id, PATCH /usuarios/:id, DELETE /usuarios/:id
- Modelo: { id, nome, email, senha, dataDeCriacao }
  - id numérico (usado nas rotas)
  - dataDeCriacao em ISO (string)
- Comportamento (contrato do teste):
  - Nunca retornar “senha” nas respostas
  - POST -> 201 c/ usuário criado
  - GET/LIST -> 200
  - PATCH -> 200 (atualização parcial)
  - DELETE -> 204
  - GET após DELETE -> 404
  - 400 para payload inválido ou id inválido (ex.: “abc”)
  - 404 para id inexistente
  - 409 para email duplicado
  - Content-Type application/json quando houver corpo

Validações mínimas
- POST: nome, email, senha obrigatórios; email válido; senha >= 6 chars
- PATCH: rejeitar body vazio; permitir atualização parcial; manter unicidade do email

Restrições
- Não usar bibliotecas além de Express e o que já está no projeto de testes.
- Sem “any”; tipagem forte; Clean Code.
- Não iniciar servidor nos testes; exportar a instância do app (export default app).
- Liberdade arquitetural: você pode organizar pastas, camadas e nomes como preferir, desde que atenda ao contrato dos testes.

Formato da resposta
1) Liste a estrutura de pastas/arquivos que você decidiu usar.
2) Forneça o código completo de cada arquivo necessário.
   - Use blocos de código TypeScript e inclua na primeira linha um comentário com o caminho do arquivo no formato:
     // filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\Claude4\task1\src\...
3) Inclua instruções rápidas de execução (npm test).
4) Opcional: explique brevemente as escolhas de projeto (máx. 5 linhas).

Critérios de aceitação
- Todos os testes em task1.test.ts passam.
- O código for executável.
- Respostas não expõem “senha”.
- dataDeCriacao é uma ISO válida.
- Códigos de status e validações conforme descrito.

------------------------------------------------------------------------