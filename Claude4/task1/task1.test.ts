/**
 * Teste E2E de CRUD de Usuário (Vitest + Supertest)
 * Stack: Express 5.1, TS 5.9
 * Contrato:
 * - Rotas: POST /usuarios, GET /usuarios, GET /usuarios/:id, PATCH /usuarios/:id, DELETE /usuarios/:id
 * - Respostas: sem campo "senha"; dataDeCriacao em ISO
 * - Status: 201/200/204/400/404/409
 * - app deve ser export default (instância do Express)
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './src/app';

type Usuario = {
  id: string | number;
  nome: string;
  email: string;
  dataDeCriacao: string;
};

const uniqueEmail = () => `user_${Date.now()}_${Math.random().toString(36).slice(2)}@exemplo.com`;

describe('CRUD de Usuário - API', () => {
  it('deve executar o fluxo completo de CRUD', async () => {
    const novo = { nome: 'Maria Silva', email: uniqueEmail(), senha: 'senhaSegura123' };

    // 1. Criar usuário (POST /usuarios)
    const resCreate = await request(app)
      .post('/usuarios')
      .send(novo)
      .expect(201)
      .expect('Content-Type', /json/);

    const created: Usuario = resCreate.body;
    expect(created).toBeTruthy();
    expect(created.id).toBeDefined();
    expect(created.nome).toBe(novo.nome);
    expect(created.email).toBe(novo.email);
    expect(created).not.toHaveProperty('senha'); // Nunca retornar senha
    expect(new Date(created.dataDeCriacao).toString()).not.toBe('Invalid Date'); // Data ISO válida

    const id = created.id;

    // 2. Buscar usuário por ID (GET /usuarios/:id)
    const resGetById = await request(app)
      .get(`/usuarios/${id}`)
      .expect(200)
      .expect('Content-Type', /json/);

    const gotById: Usuario = resGetById.body;
    expect(gotById.id).toBe(id);
    expect(gotById.nome).toBe(novo.nome);
    expect(gotById.email).toBe(novo.email);
    expect(gotById).not.toHaveProperty('senha');

    // 3. Atualizar usuário (PATCH /usuarios/:id)
    const resUpdate = await request(app)
      .patch(`/usuarios/${id}`)
      .send({ nome: 'Maria Souza' })
      .expect(200)
      .expect('Content-Type', /json/);

    const updated: Usuario = resUpdate.body;
    expect(updated.id).toBe(id);
    expect(updated.nome).toBe('Maria Souza');
    expect(updated.email).toBe(novo.email);
    expect(updated).not.toHaveProperty('senha');

    // 4. Listar todos usuários (GET /usuarios)
    const resList = await request(app)
      .get('/usuarios')
      .expect(200)
      .expect('Content-Type', /json/);

    const lista: Usuario[] = resList.body;
    expect(Array.isArray(lista)).toBe(true);
    expect(lista.some(u => u.id === id)).toBe(true);

    // 5. Deletar usuário (DELETE /usuarios/:id)
    await request(app)
      .delete(`/usuarios/${id}`)
      .expect(204);

    // 6. Confirmar que foi deletado (GET deve retornar 404)
    await request(app)
      .get(`/usuarios/${id}`)
      .expect(404);
  });

  it('deve retornar 400 ao tentar criar usuário sem campos obrigatórios', async () => {
    const resMissing = await request(app)
      .post('/usuarios')
      .send({ email: uniqueEmail() }); // Faltando nome e senha
    expect(resMissing.status).toBe(400);
  });

  describe('Validações e erros adicionais', () => {
    it('deve retornar 400 para dados inválidos (email inválido e senha curta)', async () => {
      const resInvalid = await request(app)
        .post('/usuarios')
        .send({ nome: 'João', email: 'invalido', senha: '123' }); // Email sem @ e senha < 6
      expect(resInvalid.status).toBe(400);
    });

    it('deve retornar 409 ao criar usuário com email duplicado', async () => {
      const email = uniqueEmail();
      const base = { nome: 'Ana', email, senha: 'SenhaForte123' };

      // Criar primeiro usuário
      const r1 = await request(app).post('/usuarios').send(base).expect(201);
      expect(r1.body.email).toBe(email);

      // Tentar criar segundo usuário com mesmo email
      await request(app).post('/usuarios').send({ ...base, nome: 'Outra Pessoa' }).expect(409);
    });

    it('GET /usuarios/:id deve retornar 404 quando não existir', async () => {
      const resNotFound = await request(app).get('/usuarios/999999999');
      expect(resNotFound.status).toBe(404);
    });

    it('PATCH /usuarios/:id deve retornar 400 para id inválido', async () => {
      const resBadId = await request(app).patch('/usuarios/abc').send({ nome: 'X' });
      expect(resBadId.status).toBe(400);
    });

    it('PATCH /usuarios/:id deve retornar 404 quando não existir', async () => {
      const resPatchNotFound = await request(app).patch('/usuarios/999999999').send({ nome: 'X' });
      expect(resPatchNotFound.status).toBe(404);
    });

    it('PATCH deve retornar 400 quando body estiver vazio', async () => {
      const novo = { nome: 'Carlos', email: uniqueEmail(), senha: 'SenhaSegura999' };
      const resCreate = await request(app).post('/usuarios').send(novo);
      expect(resCreate.status).toBe(201);

      const id = resCreate.body.id;

      // Tentar atualizar sem fornecer nenhum campo
      const resEmpty = await request(app).patch(`/usuarios/${id}`).send({});
      expect(resEmpty.status).toBe(400);
    });

    it('DELETE /usuarios/:id deve retornar 404 quando não existir', async () => {
      const resDelete = await request(app).delete('/usuarios/999999999');
      expect(resDelete.status).toBe(404);
    });
  });
});