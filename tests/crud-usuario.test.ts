import request from 'supertest';
import { Express } from 'express';

/**
 * Testes para o CRUD de Usuário - Tarefa 1
 * 
 * Estes testes validam se o código gerado pelos LLMs implementa
 * corretamente todas as operações CRUD para a entidade Usuario.
 * 
 * Modelo de dados esperado:
 * - id: string | number
 * - nome: string
 * - email: string
 * - senha: string
 * - dataDeCriacao: Date | string
 */

describe('CRUD de Usuário - Tarefa 1', () => {
  let app: Express;

  // Mock de usuário para testes
  const usuarioTeste = {
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    senha: 'senha123'
  };

  const usuarioAtualizado = {
    nome: 'João Santos',
    email: 'joao.santos@email.com',
    senha: 'novaSenha123'
  };

  beforeAll(async () => {
    // O app deve ser importado do código gerado pelos LLMs
    // Assumindo que será implementado em src/app.ts ou src/index.ts
    try {
      const appModule = await import('../src/app');
      app = appModule.default || appModule.app;
    } catch (error) {
      console.error('Erro ao importar a aplicação:', error);
      throw new Error('Aplicação não encontrada. Verifique se src/app.ts existe.');
    }
  });

  describe('POST /usuarios - Criar usuário', () => {
    test('Deve criar um novo usuário com dados válidos', async () => {
      const response = await request(app)
        .post('/usuarios')
        .send(usuarioTeste)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nome', usuarioTeste.nome);
      expect(response.body).toHaveProperty('email', usuarioTeste.email);
      expect(response.body).toHaveProperty('dataDeCriacao');
      expect(response.body).not.toHaveProperty('senha'); // Senha não deve ser retornada
    });

    test('Deve retornar erro 400 para dados inválidos', async () => {
      await request(app)
        .post('/usuarios')
        .send({})
        .expect(400);
    });

    test('Deve retornar erro 400 para email inválido', async () => {
      await request(app)
        .post('/usuarios')
        .send({
          ...usuarioTeste,
          email: 'email-invalido'
        })
        .expect(400);
    });

    test('Deve retornar erro 409 para email duplicado', async () => {
      // Primeiro usuário
      await request(app)
        .post('/usuarios')
        .send(usuarioTeste)
        .expect(201);

      // Segundo usuário com mesmo email
      await request(app)
        .post('/usuarios')
        .send(usuarioTeste)
        .expect(409);
    });
  });

  describe('GET /usuarios - Listar usuários', () => {
    beforeEach(async () => {
      // Limpar dados antes de cada teste
      // Isso pode variar dependendo da implementação
    });

    test('Deve retornar lista vazia quando não há usuários', async () => {
      const response = await request(app)
        .get('/usuarios')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Deve retornar lista de usuários', async () => {
      // Criar usuário primeiro
      await request(app)
        .post('/usuarios')
        .send(usuarioTeste);

      const response = await request(app)
        .get('/usuarios')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('nome');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).not.toHaveProperty('senha');
    });
  });

  describe('GET /usuarios/:id - Buscar usuário por ID', () => {
    let usuarioId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/usuarios')
        .send(usuarioTeste);
      usuarioId = response.body.id;
    });

    test('Deve retornar usuário existente', async () => {
      const response = await request(app)
        .get(`/usuarios/${usuarioId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', usuarioId);
      expect(response.body).toHaveProperty('nome', usuarioTeste.nome);
      expect(response.body).toHaveProperty('email', usuarioTeste.email);
      expect(response.body).not.toHaveProperty('senha');
    });

    test('Deve retornar erro 404 para usuário inexistente', async () => {
      await request(app)
        .get('/usuarios/999999')
        .expect(404);
    });

    test('Deve retornar erro 400 para ID inválido', async () => {
      await request(app)
        .get('/usuarios/id-invalido')
        .expect(400);
    });
  });

  describe('PUT /usuarios/:id - Atualizar usuário', () => {
    let usuarioId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/usuarios')
        .send(usuarioTeste);
      usuarioId = response.body.id;
    });

    test('Deve atualizar usuário existente', async () => {
      const response = await request(app)
        .put(`/usuarios/${usuarioId}`)
        .send(usuarioAtualizado)
        .expect(200);

      expect(response.body).toHaveProperty('id', usuarioId);
      expect(response.body).toHaveProperty('nome', usuarioAtualizado.nome);
      expect(response.body).toHaveProperty('email', usuarioAtualizado.email);
      expect(response.body).not.toHaveProperty('senha');
    });

    test('Deve retornar erro 404 para usuário inexistente', async () => {
      await request(app)
        .put('/usuarios/999999')
        .send(usuarioAtualizado)
        .expect(404);
    });

    test('Deve retornar erro 400 para dados inválidos', async () => {
      await request(app)
        .put(`/usuarios/${usuarioId}`)
        .send({ email: 'email-invalido' })
        .expect(400);
    });

    test('Deve permitir atualização parcial', async () => {
      const response = await request(app)
        .put(`/usuarios/${usuarioId}`)
        .send({ nome: 'Novo Nome' })
        .expect(200);

      expect(response.body).toHaveProperty('nome', 'Novo Nome');
      expect(response.body).toHaveProperty('email', usuarioTeste.email);
    });
  });

  describe('DELETE /usuarios/:id - Deletar usuário', () => {
    let usuarioId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/usuarios')
        .send(usuarioTeste);
      usuarioId = response.body.id;
    });

    test('Deve deletar usuário existente', async () => {
      await request(app)
        .delete(`/usuarios/${usuarioId}`)
        .expect(204);

      // Verificar se usuário foi realmente deletado
      await request(app)
        .get(`/usuarios/${usuarioId}`)
        .expect(404);
    });

    test('Deve retornar erro 404 para usuário inexistente', async () => {
      await request(app)
        .delete('/usuarios/999999')
        .expect(404);
    });

    test('Deve retornar erro 400 para ID inválido', async () => {
      await request(app)
        .delete('/usuarios/id-invalido')
        .expect(400);
    });
  });

  describe('Validações de Segurança', () => {
    test('Deve sanitizar dados de entrada', async () => {
      const dadosComScript = {
        nome: '<script>alert("xss")</script>João',
        email: 'joao@email.com',
        senha: 'senha123'
      };

      const response = await request(app)
        .post('/usuarios')
        .send(dadosComScript)
        .expect(201);

      expect(response.body.nome).not.toContain('<script>');
    });

    test('Deve limitar tamanho dos campos', async () => {
      const dadosGrandes = {
        nome: 'A'.repeat(1000),
        email: 'email@teste.com',
        senha: 'senha123'
      };

      await request(app)
        .post('/usuarios')
        .send(dadosGrandes)
        .expect(400);
    });
  });

  describe('Validações de Performance', () => {
    test('Deve responder em tempo hábil', async () => {
      const start = Date.now();

      await request(app)
        .get('/usuarios')
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Menos que 1 segundo
    });
  });
});
