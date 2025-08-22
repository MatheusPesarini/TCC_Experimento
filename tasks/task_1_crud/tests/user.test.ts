import request from 'supertest';

// Para cada projeto (gpt5/claude4) o jest.config.ts mapeia @app para o caminho correto
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { buildApp } from '@app/app';

describe('CRUD de usuários', () => {
  const app = buildApp();
  let createdId: number;

  it('cria usuário (POST /users)', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'alice@example.com' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Alice', email: 'alice@example.com' });
    createdId = res.body.id;
    expect(createdId).toBeGreaterThan(0);
  });

  it('lista usuários (GET /users)', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('busca usuário por id (GET /users/:id)', async () => {
    const res = await request(app).get(`/users/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  it('atualiza usuário (PUT /users/:id)', async () => {
    const res = await request(app)
      .put(`/users/${createdId}`)
      .send({ name: 'Alice Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alice Updated');
  });

  it('remove usuário (DELETE /users/:id)', async () => {
    const res = await request(app).delete(`/users/${createdId}`);
    expect(res.status).toBe(204);
  });
});
