/**
 * Teste E2E de Sistema de Gerenciamento de Biblioteca (Vitest + Supertest)
 * Stack: Express 5.1, TS 5.9
 * Módulos: Livros + Empréstimos
 * Contrato:
 * - Rotas Livros: POST /livros, GET /livros, GET /livros/:id, PATCH /livros/:id, DELETE /livros/:id
 * - Rotas Empréstimos: POST /emprestimos, GET /emprestimos, GET /emprestimos/:id, PATCH /emprestimos/:id/devolver, DELETE /emprestimos/:id
 * - Respostas: JSON; datas em ISO 8601
 * - Status: 201/200/204/400/404/409
 * - app deve ser export default (instância do Express)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from './src/app';

type Livro = {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  dataDeCadastro: string;
};

type Emprestimo = {
  id: number;
  livroId: number;
  nomeUsuario: string;
  emailUsuario: string;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolvido?: string;
  status: 'ativo' | 'devolvido';
};

const uniqueISBN = () => {
  const rand = () => Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${rand()}-${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}-${Math.floor(Math.random() * 10)}`;
};

const uniqueEmail = () => `usuario_${Date.now()}_${Math.random().toString(36).slice(2)}@biblioteca.com`;

describe('Sistema de Gerenciamento de Biblioteca', () => {
  describe('MÓDULO 1 - Gerenciamento de Livros', () => {
    it('deve executar o fluxo completo de CRUD de livros', async () => {
      const novoLivro = {
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        isbn: uniqueISBN(),
        quantidadeTotal: 5
      };

      // 1. Criar livro (POST /livros)
      const resCreate = await request(app)
        .post('/livros')
        .send(novoLivro)
        .expect(201)
        .expect('Content-Type', /json/);

      const created: Livro = resCreate.body;
      expect(created).toBeTruthy();
      expect(created.id).toBeDefined();
      expect(created.titulo).toBe(novoLivro.titulo);
      expect(created.autor).toBe(novoLivro.autor);
      expect(created.isbn).toBe(novoLivro.isbn);
      expect(created.quantidadeTotal).toBe(novoLivro.quantidadeTotal);
      expect(created.quantidadeDisponivel).toBe(novoLivro.quantidadeTotal); // Regra: inicia igual
      expect(new Date(created.dataDeCadastro).toString()).not.toBe('Invalid Date');

      const id = created.id;

      // 2. Buscar livro por ID (GET /livros/:id)
      const resGetById = await request(app)
        .get(`/livros/${id}`)
        .expect(200)
        .expect('Content-Type', /json/);

      const gotById: Livro = resGetById.body;
      expect(gotById.id).toBe(id);
      expect(gotById.titulo).toBe(novoLivro.titulo);

      // 3. Atualizar livro (PATCH /livros/:id)
      const resUpdate = await request(app)
        .patch(`/livros/${id}`)
        .send({ titulo: 'Clean Code - 2nd Edition' })
        .expect(200)
        .expect('Content-Type', /json/);

      const updated: Livro = resUpdate.body;
      expect(updated.id).toBe(id);
      expect(updated.titulo).toBe('Clean Code - 2nd Edition');
      expect(updated.autor).toBe(novoLivro.autor);

      // 4. Listar todos livros (GET /livros)
      const resList = await request(app)
        .get('/livros')
        .expect(200)
        .expect('Content-Type', /json/);

      const lista: Livro[] = resList.body;
      expect(Array.isArray(lista)).toBe(true);
      expect(lista.some(l => l.id === id)).toBe(true);

      // 5. Deletar livro (DELETE /livros/:id)
      await request(app)
        .delete(`/livros/${id}`)
        .expect(204);

      // 6. Confirmar que foi deletado
      await request(app)
        .get(`/livros/${id}`)
        .expect(404);
    });

    it('deve retornar 400 ao criar livro sem campos obrigatórios', async () => {
      await request(app)
        .post('/livros')
        .send({ titulo: 'Livro Incompleto' }) // Faltando autor, isbn, quantidadeTotal
        .expect(400);
    });

    it('deve retornar 400 para ISBN inválido', async () => {
      await request(app)
        .post('/livros')
        .send({
          titulo: 'Test',
          autor: 'Author',
          isbn: 'INVALID-ISBN',
          quantidadeTotal: 1
        })
        .expect(400);
    });

    it('deve retornar 409 para ISBN duplicado', async () => {
      const isbn = uniqueISBN();
      const livro = {
        titulo: 'Livro Original',
        autor: 'Autor Original',
        isbn,
        quantidadeTotal: 3
      };

      await request(app).post('/livros').send(livro).expect(201);
      await request(app).post('/livros').send({ ...livro, titulo: 'Livro Duplicado' }).expect(409);
    });

    it('GET /livros/:id deve retornar 400 para id inválido', async () => {
      await request(app).get('/livros/abc').expect(400);
    });

    it('GET /livros/:id deve retornar 404 quando não existir', async () => {
      await request(app).get('/livros/999999999').expect(404);
    });

    it('PATCH /livros/:id deve retornar 400 para body vazio', async () => {
      const livro = {
        titulo: 'Test Book',
        autor: 'Test Author',
        isbn: uniqueISBN(),
        quantidadeTotal: 1
      };
      const res = await request(app).post('/livros').send(livro).expect(201);
      const id = res.body.id;

      await request(app).patch(`/livros/${id}`).send({}).expect(400);
    });

    it('PATCH /livros/:id deve retornar 404 quando não existir', async () => {
      await request(app)
        .patch('/livros/999999999')
        .send({ titulo: 'Novo Titulo' })
        .expect(404);
    });

    it('DELETE /livros/:id deve retornar 404 quando não existir', async () => {
      await request(app).delete('/livros/999999999').expect(404);
    });
  });

  describe('MÓDULO 2 - Gerenciamento de Empréstimos', () => {
    let livroId: number;

    beforeEach(async () => {
      // Criar um livro para usar nos testes de empréstimo
      const livro = {
        titulo: 'Livro para Empréstimo',
        autor: 'Autor Teste',
        isbn: uniqueISBN(),
        quantidadeTotal: 5
      };
      const res = await request(app).post('/livros').send(livro);
      livroId = res.body.id;
    });

    it('deve executar o fluxo completo de empréstimo e devolução', async () => {
      const novoEmprestimo = {
        livroId,
        nomeUsuario: 'João Silva',
        emailUsuario: uniqueEmail(),
        dataEmprestimo: new Date().toISOString()
      };

      // 1. Criar empréstimo (POST /emprestimos)
      const resCreate = await request(app)
        .post('/emprestimos')
        .send(novoEmprestimo)
        .expect(201)
        .expect('Content-Type', /json/);

      const created: Emprestimo = resCreate.body;
      expect(created).toBeTruthy();
      expect(created.id).toBeDefined();
      expect(created.livroId).toBe(livroId);
      expect(created.nomeUsuario).toBe(novoEmprestimo.nomeUsuario);
      expect(created.emailUsuario).toBe(novoEmprestimo.emailUsuario);
      expect(created.status).toBe('ativo');
      expect(created.dataDevolvido).toBeUndefined();
      expect(new Date(created.dataEmprestimo).toString()).not.toBe('Invalid Date');
      expect(new Date(created.dataPrevistaDevolucao).toString()).not.toBe('Invalid Date');

      // Verificar que dataPrevistaDevolucao é 14 dias após dataEmprestimo
      const dataEmp = new Date(created.dataEmprestimo);
      const dataPrev = new Date(created.dataPrevistaDevolucao);
      const diffDays = Math.floor((dataPrev.getTime() - dataEmp.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(14);

      const id = created.id;

      // Verificar que quantidadeDisponivel foi decrementada
      const resLivro = await request(app).get(`/livros/${livroId}`);
      expect(resLivro.body.quantidadeDisponivel).toBe(4); // Era 5, agora 4

      // 2. Buscar empréstimo por ID (GET /emprestimos/:id)
      const resGetById = await request(app)
        .get(`/emprestimos/${id}`)
        .expect(200)
        .expect('Content-Type', /json/);

      const gotById = resGetById.body;
      expect(gotById.id).toBe(id);
      expect(gotById.livroId).toBe(livroId);

      // 3. Listar todos empréstimos (GET /emprestimos)
      const resList = await request(app)
        .get('/emprestimos')
        .expect(200)
        .expect('Content-Type', /json/);

      const lista: Emprestimo[] = resList.body;
      expect(Array.isArray(lista)).toBe(true);
      expect(lista.some(e => e.id === id)).toBe(true);

      // 4. Devolver livro (PATCH /emprestimos/:id/devolver)
      const resDevolver = await request(app)
        .patch(`/emprestimos/${id}/devolver`)
        .expect(200)
        .expect('Content-Type', /json/);

      const devolvido: Emprestimo = resDevolver.body;
      expect(devolvido.id).toBe(id);
      expect(devolvido.status).toBe('devolvido');
      expect(devolvido.dataDevolvido).toBeDefined();
      expect(new Date(devolvido.dataDevolvido!).toString()).not.toBe('Invalid Date');

      // Verificar que quantidadeDisponivel foi incrementada
      const resLivro2 = await request(app).get(`/livros/${livroId}`);
      expect(resLivro2.body.quantidadeDisponivel).toBe(5); // Voltou para 5
    });

    it('deve executar fluxo de cancelamento de empréstimo', async () => {
      const novoEmprestimo = {
        livroId,
        nomeUsuario: 'Maria Santos',
        emailUsuario: uniqueEmail(),
        dataEmprestimo: new Date().toISOString()
      };

      const resCreate = await request(app).post('/emprestimos').send(novoEmprestimo).expect(201);
      const id = resCreate.body.id;

      // Verificar estoque antes do cancelamento
      const resLivroAntes = await request(app).get(`/livros/${livroId}`);
      const disponivelAntes = resLivroAntes.body.quantidadeDisponivel;

      // Cancelar empréstimo (DELETE /emprestimos/:id)
      await request(app).delete(`/emprestimos/${id}`).expect(204);

      // Verificar que quantidadeDisponivel foi restaurada
      const resLivroDepois = await request(app).get(`/livros/${livroId}`);
      expect(resLivroDepois.body.quantidadeDisponivel).toBe(disponivelAntes + 1);

      // Confirmar que foi deletado
      await request(app).get(`/emprestimos/${id}`).expect(404);
    });

    it('deve retornar 400 ao criar empréstimo sem campos obrigatórios', async () => {
      await request(app)
        .post('/emprestimos')
        .send({ nomeUsuario: 'João' }) // Faltando campos
        .expect(400);
    });

    it('deve retornar 400 para email inválido', async () => {
      await request(app)
        .post('/emprestimos')
        .send({
          livroId,
          nomeUsuario: 'João',
          emailUsuario: 'email-invalido',
          dataEmprestimo: new Date().toISOString()
        })
        .expect(400);
    });

    it('deve retornar 404 ao criar empréstimo com livroId inexistente', async () => {
      await request(app)
        .post('/emprestimos')
        .send({
          livroId: 999999999,
          nomeUsuario: 'João',
          emailUsuario: uniqueEmail(),
          dataEmprestimo: new Date().toISOString()
        })
        .expect(404);
    });

    it('deve retornar 409 ao criar empréstimo sem exemplares disponíveis', async () => {
      // Criar livro com apenas 1 exemplar
      const livroUnico = {
        titulo: 'Livro Único',
        autor: 'Autor',
        isbn: uniqueISBN(),
        quantidadeTotal: 1
      };
      const resLivro = await request(app).post('/livros').send(livroUnico);
      const idLivroUnico = resLivro.body.id;

      // Criar primeiro empréstimo (sucesso)
      const emprestimo1 = {
        livroId: idLivroUnico,
        nomeUsuario: 'Usuário 1',
        emailUsuario: uniqueEmail(),
        dataEmprestimo: new Date().toISOString()
      };
      await request(app).post('/emprestimos').send(emprestimo1).expect(201);

      // Tentar criar segundo empréstimo (falha - sem estoque)
      const emprestimo2 = {
        livroId: idLivroUnico,
        nomeUsuario: 'Usuário 2',
        emailUsuario: uniqueEmail(),
        dataEmprestimo: new Date().toISOString()
      };
      await request(app).post('/emprestimos').send(emprestimo2).expect(409);
    });

    it('GET /emprestimos/:id deve retornar 400 para id inválido', async () => {
      await request(app).get('/emprestimos/abc').expect(400);
    });

    it('GET /emprestimos/:id deve retornar 404 quando não existir', async () => {
      await request(app).get('/emprestimos/999999999').expect(404);
    });

    it('PATCH /emprestimos/:id/devolver deve retornar 404 quando não existir', async () => {
      await request(app).patch('/emprestimos/999999999/devolver').expect(404);
    });

    it('PATCH /emprestimos/:id/devolver deve retornar 409 se já devolvido', async () => {
      const emprestimo = {
        livroId,
        nomeUsuario: 'Pedro',
        emailUsuario: uniqueEmail(),
        dataEmprestimo: new Date().toISOString()
      };
      const res = await request(app).post('/emprestimos').send(emprestimo).expect(201);
      const id = res.body.id;

      // Devolver primeira vez (sucesso)
      await request(app).patch(`/emprestimos/${id}/devolver`).expect(200);

      // Tentar devolver novamente (falha)
      await request(app).patch(`/emprestimos/${id}/devolver`).expect(409);
    });

    it('DELETE /emprestimos/:id deve retornar 404 quando não existir', async () => {
      await request(app).delete('/emprestimos/999999999').expect(404);
    });

    it('DELETE /emprestimos/:id deve retornar 409 se já devolvido', async () => {
      const emprestimo = {
        livroId,
        nomeUsuario: 'Carlos',
        emailUsuario: uniqueEmail(),
        dataEmprestimo: new Date().toISOString()
      };
      const res = await request(app).post('/emprestimos').send(emprestimo).expect(201);
      const id = res.body.id;

      // Devolver
      await request(app).patch(`/emprestimos/${id}/devolver`).expect(200);

      // Tentar cancelar após devolução (falha)
      await request(app).delete(`/emprestimos/${id}`).expect(409);
    });
  });

  describe('Regras de Negócio - Integridade Referencial', () => {
    it('não deve permitir deletar livro com empréstimos ativos', async () => {
      // Criar livro
      const livro = {
        titulo: 'Livro Bloqueado',
        autor: 'Autor',
        isbn: uniqueISBN(),
        quantidadeTotal: 2
      };
      const resLivro = await request(app).post('/livros').send(livro).expect(201);
      const livroId = resLivro.body.id;

      // Criar empréstimo ativo
      const emprestimo = {
        livroId,
        nomeUsuario: 'Ana',
        emailUsuario: uniqueEmail(),
        dataEmprestimo: new Date().toISOString()
      };
      await request(app).post('/emprestimos').send(emprestimo).expect(201);

      // Tentar deletar livro (deve falhar)
      await request(app).delete(`/livros/${livroId}`).expect(409);
    });

    it('deve permitir deletar livro após todos empréstimos serem devolvidos', async () => {
      // Criar livro
      const livro = {
        titulo: 'Livro Liberável',
        autor: 'Autor',
        isbn: uniqueISBN(),
        quantidadeTotal: 1
      };
      const resLivro = await request(app).post('/livros').send(livro).expect(201);
      const livroId = resLivro.body.id;

      // Criar e devolver empréstimo
      const emprestimo = {
        livroId,
        nomeUsuario: 'Bruno',
        emailUsuario: uniqueEmail(),
        dataEmprestimo: new Date().toISOString()
      };
      const resEmp = await request(app).post('/emprestimos').send(emprestimo).expect(201);
      await request(app).patch(`/emprestimos/${resEmp.body.id}/devolver`).expect(200);

      // Agora deve conseguir deletar
      await request(app).delete(`/livros/${livroId}`).expect(204);
    });
  });

  describe('Validações de Atualização de Livro', () => {
    it('não deve permitir quantidadeTotal menor que exemplares emprestados', async () => {
      // Criar livro com 5 exemplares
      const livro = {
        titulo: 'Livro Popular',
        autor: 'Autor',
        isbn: uniqueISBN(),
        quantidadeTotal: 5
      };
      const resLivro = await request(app).post('/livros').send(livro).expect(201);
      const livroId = resLivro.body.id;

      // Emprestar 3 exemplares
      for (let i = 0; i < 3; i++) {
        await request(app).post('/emprestimos').send({
          livroId,
          nomeUsuario: `Usuario ${i}`,
          emailUsuario: uniqueEmail(),
          dataEmprestimo: new Date().toISOString()
        }).expect(201);
      }

      // Tentar atualizar quantidadeTotal para 2 (deve falhar, pois 3 estão emprestados)
      await request(app)
        .patch(`/livros/${livroId}`)
        .send({ quantidadeTotal: 2 })
        .expect(400);

      // Atualizar para 4 deve funcionar (3 emprestados + 1 disponível)
      await request(app)
        .patch(`/livros/${livroId}`)
        .send({ quantidadeTotal: 4 })
        .expect(200);
    });
  });
});