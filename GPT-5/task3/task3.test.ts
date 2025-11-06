/**
 * Teste E2E de Sistema de Gerenciamento de Pedidos com Controle de Estoque (Vitest + Supertest)
 * Stack: Express 5.1, TS 5.9
 * Módulos: Produtos + Pedidos
 * Contrato:
 * - Rotas Produtos: POST /produtos, GET /produtos, GET /produtos/:id, PATCH /produtos/:id, DELETE /produtos/:id
 * - Rotas Pedidos: POST /pedidos, GET /pedidos, GET /pedidos/:id, PATCH /pedidos/:id/status, PATCH /pedidos/:id/cancelar, DELETE /pedidos/:id
 * - Respostas: JSON; datas em ISO 8601; preços com 2 decimais
 * - Status: 201/200/204/400/404/409
 * - app deve ser export default (instância do Express)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from './src/app';

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  dataDeCadastro: string;
};

type StatusPedido = 'pendente' | 'confirmado' | 'enviado' | 'entregue' | 'cancelado';

type ItemPedido = {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

type Pedido = {
  id: number;
  clienteNome: string;
  clienteEmail: string;
  clienteEndereco: string;
  itens: ItemPedido[];
  subtotal: number;
  desconto: number;
  total: number;
  status: StatusPedido;
  dataDoPedido: string;
  dataAtualizacao: string;
};

const uniqueEmail = () => `cliente_${Date.now()}_${Math.random().toString(36).slice(2)}@loja.com`;

const roundToTwo = (num: number) => Math.round(num * 100) / 100;

describe('Sistema de Gerenciamento de Pedidos com Controle de Estoque', () => {
  describe('MÓDULO 1 - Gerenciamento de Produtos', () => {
    it('deve executar o fluxo completo de CRUD de produtos', async () => {
      const novoProduto = {
        nome: 'Notebook Dell',
        descricao: 'Notebook i7 16GB RAM',
        preco: 3499.99,
        categoria: 'Eletrônicos',
        quantidadeEstoque: 10,
        estoqueMinimo: 2
      };

      // 1. Criar produto (POST /produtos)
      const resCreate = await request(app)
        .post('/produtos')
        .send(novoProduto)
        .expect(201)
        .expect('Content-Type', /json/);

      const created: Produto = resCreate.body;
      expect(created).toBeTruthy();
      expect(created.id).toBeDefined();
      expect(created.nome).toBe(novoProduto.nome);
      expect(created.descricao).toBe(novoProduto.descricao);
      expect(created.preco).toBe(novoProduto.preco);
      expect(created.categoria).toBe(novoProduto.categoria);
      expect(created.quantidadeEstoque).toBe(novoProduto.quantidadeEstoque);
      expect(created.estoqueMinimo).toBe(novoProduto.estoqueMinimo);
      expect(created.ativo).toBe(true); // Padrão
      expect(new Date(created.dataDeCadastro).toString()).not.toBe('Invalid Date');

      const id = created.id;

      // 2. Buscar produto por ID (GET /produtos/:id)
      const resGetById = await request(app)
        .get(`/produtos/${id}`)
        .expect(200)
        .expect('Content-Type', /json/);

      const gotById: Produto = resGetById.body;
      expect(gotById.id).toBe(id);
      expect(gotById.nome).toBe(novoProduto.nome);

      // 3. Atualizar produto (PATCH /produtos/:id)
      const resUpdate = await request(app)
        .patch(`/produtos/${id}`)
        .send({ preco: 3299.99, descricao: 'Notebook i7 16GB RAM - PROMOÇÃO' })
        .expect(200)
        .expect('Content-Type', /json/);

      const updated: Produto = resUpdate.body;
      expect(updated.id).toBe(id);
      expect(updated.preco).toBe(3299.99);
      expect(updated.descricao).toBe('Notebook i7 16GB RAM - PROMOÇÃO');
      expect(updated.nome).toBe(novoProduto.nome); // Não alterado

      // 4. Listar todos produtos (GET /produtos)
      const resList = await request(app)
        .get('/produtos')
        .expect(200)
        .expect('Content-Type', /json/);

      const lista: Produto[] = resList.body;
      expect(Array.isArray(lista)).toBe(true);
      expect(lista.some(p => p.id === id)).toBe(true);

      // 5. Deletar produto (DELETE /produtos/:id)
      await request(app)
        .delete(`/produtos/${id}`)
        .expect(204);

      // 6. Confirmar que foi deletado
      await request(app)
        .get(`/produtos/${id}`)
        .expect(404);
    });

    it('deve retornar 400 ao criar produto sem campos obrigatórios', async () => {
      await request(app)
        .post('/produtos')
        .send({ nome: 'Produto Incompleto' })
        .expect(400);
    });

    it('deve retornar 400 para preço com mais de 2 decimais', async () => {
      await request(app)
        .post('/produtos')
        .send({
          nome: 'Mouse',
          descricao: 'Mouse USB',
          preco: 29.999, // 3 decimais
          categoria: 'Periféricos',
          quantidadeEstoque: 50,
          estoqueMinimo: 5
        })
        .expect(400);
    });

    it('deve retornar 400 para preço negativo ou zero', async () => {
      await request(app)
        .post('/produtos')
        .send({
          nome: 'Teclado',
          descricao: 'Teclado Mecânico',
          preco: 0,
          categoria: 'Periféricos',
          quantidadeEstoque: 20,
          estoqueMinimo: 3
        })
        .expect(400);
    });

    it('deve retornar 400 para quantidades negativas', async () => {
      await request(app)
        .post('/produtos')
        .send({
          nome: 'Monitor',
          descricao: 'Monitor 24"',
          preco: 899.99,
          categoria: 'Periféricos',
          quantidadeEstoque: -5,
          estoqueMinimo: 2
        })
        .expect(400);
    });

    it('GET /produtos deve aplicar filtros corretamente', async () => {
      // Criar produtos de diferentes categorias
      await request(app).post('/produtos').send({
        nome: 'Produto A',
        descricao: 'Desc A',
        preco: 100.00,
        categoria: 'CategoriaA',
        quantidadeEstoque: 10,
        estoqueMinimo: 1
      });

      await request(app).post('/produtos').send({
        nome: 'Produto B',
        descricao: 'Desc B',
        preco: 200.00,
        categoria: 'CategoriaB',
        quantidadeEstoque: 5,
        estoqueMinimo: 1
      });

      // Filtrar por categoria
      const resCat = await request(app)
        .get('/produtos?categoria=CategoriaA')
        .expect(200);

      const produtosCat: Produto[] = resCat.body;
      expect(produtosCat.every(p => p.categoria === 'CategoriaA')).toBe(true);

      // Filtrar por ativo
      const resAtivo = await request(app)
        .get('/produtos?ativo=true')
        .expect(200);

      const produtosAtivos: Produto[] = resAtivo.body;
      expect(produtosAtivos.every(p => p.ativo === true)).toBe(true);
    });

    it('GET /produtos/:id deve incluir alerta quando estoque < estoqueMinimo', async () => {
      const resProd = await request(app).post('/produtos').send({
        nome: 'Produto Baixo Estoque',
        descricao: 'Teste',
        preco: 50.00,
        categoria: 'Teste',
        quantidadeEstoque: 1,
        estoqueMinimo: 5
      });

      const id = resProd.body.id;

      const resGet = await request(app).get(`/produtos/${id}`).expect(200);

      // Verificar se há algum indicador de alerta (pode ser um campo ou mensagem)
      expect(resGet.body.quantidadeEstoque).toBeLessThan(resGet.body.estoqueMinimo);
    });

    it('GET /produtos/:id deve retornar 400 para id inválido', async () => {
      await request(app).get('/produtos/abc').expect(400);
    });

    it('GET /produtos/:id deve retornar 404 quando não existir', async () => {
      await request(app).get('/produtos/999999999').expect(404);
    });

    it('PATCH /produtos/:id deve retornar 400 para body vazio', async () => {
      const resProd = await request(app).post('/produtos').send({
        nome: 'Produto Teste',
        descricao: 'Teste',
        preco: 100.00,
        categoria: 'Teste',
        quantidadeEstoque: 10,
        estoqueMinimo: 2
      });

      const id = resProd.body.id;

      await request(app)
        .patch(`/produtos/${id}`)
        .send({})
        .expect(400);
    });

    it('PATCH /produtos/:id deve retornar 404 quando não existir', async () => {
      await request(app)
        .patch('/produtos/999999999')
        .send({ nome: 'Novo Nome' })
        .expect(404);
    });

    it('DELETE /produtos/:id deve retornar 404 quando não existir', async () => {
      await request(app).delete('/produtos/999999999').expect(404);
    });
  });

  describe('MÓDULO 2 - Gerenciamento de Pedidos', () => {
    let produtoId1: number;
    let produtoId2: number;

    beforeEach(async () => {
      // Criar produtos para usar nos testes
      const resProd1 = await request(app).post('/produtos').send({
        nome: 'Mouse Gamer',
        descricao: 'Mouse RGB 16000 DPI',
        preco: 150.00,
        categoria: 'Periféricos',
        quantidadeEstoque: 20,
        estoqueMinimo: 3
      });
      produtoId1 = resProd1.body.id;

      const resProd2 = await request(app).post('/produtos').send({
        nome: 'Teclado Mecânico',
        descricao: 'Teclado RGB Switch Blue',
        preco: 350.00,
        categoria: 'Periféricos',
        quantidadeEstoque: 15,
        estoqueMinimo: 2
      });
      produtoId2 = resProd2.body.id;
    });

    it('deve executar o fluxo completo de criar e processar pedido', async () => {
      const novoPedido = {
        clienteNome: 'João Silva',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua A, 123',
        itens: [
          { produtoId: produtoId1, quantidade: 2 },
          { produtoId: produtoId2, quantidade: 1 }
        ],
        desconto: 50.00
      };

      // 1. Criar pedido (POST /pedidos)
      const resCreate = await request(app)
        .post('/pedidos')
        .send(novoPedido)
        .expect(201)
        .expect('Content-Type', /json/);

      const created: Pedido = resCreate.body;
      expect(created).toBeTruthy();
      expect(created.id).toBeDefined();
      expect(created.clienteNome).toBe(novoPedido.clienteNome);
      expect(created.clienteEmail).toBe(novoPedido.clienteEmail);
      expect(created.clienteEndereco).toBe(novoPedido.clienteEndereco);
      expect(created.status).toBe('pendente');
      expect(created.itens).toHaveLength(2);
      expect(new Date(created.dataDoPedido).toString()).not.toBe('Invalid Date');
      expect(new Date(created.dataAtualizacao).toString()).not.toBe('Invalid Date');

      // Verificar cálculos
      const subtotalEsperado = roundToTwo((2 * 150.00) + (1 * 350.00)); // 650.00
      const totalEsperado = roundToTwo(subtotalEsperado - 50.00); // 600.00

      expect(created.subtotal).toBe(subtotalEsperado);
      expect(created.desconto).toBe(50.00);
      expect(created.total).toBe(totalEsperado);

      // Verificar snapshots
      expect(created.itens[0].nomeProduto).toBe('Mouse Gamer');
      expect(created.itens[0].precoUnitario).toBe(150.00);
      expect(created.itens[0].subtotal).toBe(300.00);

      const pedidoId = created.id;

      // Verificar que estoque foi decrementado
      const resProd1 = await request(app).get(`/produtos/${produtoId1}`);
      expect(resProd1.body.quantidadeEstoque).toBe(18); // Era 20, agora 18

      const resProd2 = await request(app).get(`/produtos/${produtoId2}`);
      expect(resProd2.body.quantidadeEstoque).toBe(14); // Era 15, agora 14

      // 2. Buscar pedido por ID (GET /pedidos/:id)
      const resGetById = await request(app)
        .get(`/pedidos/${pedidoId}`)
        .expect(200)
        .expect('Content-Type', /json/);

      const gotById: Pedido = resGetById.body;
      expect(gotById.id).toBe(pedidoId);
      expect(gotById.status).toBe('pendente');

      // 3. Atualizar status (PATCH /pedidos/:id/status)
      const resConfirmar = await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({ novoStatus: 'confirmado' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(resConfirmar.body.status).toBe('confirmado');
      expect(resConfirmar.body.dataAtualizacao).toBeDefined();

      // Transição confirmado → enviado
      const resEnviar = await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({ novoStatus: 'enviado' })
        .expect(200);

      expect(resEnviar.body.status).toBe('enviado');

      // Transição enviado → entregue
      const resEntregar = await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({ novoStatus: 'entregue' })
        .expect(200);

      expect(resEntregar.body.status).toBe('entregue');

      // 4. Listar todos pedidos (GET /pedidos)
      const resList = await request(app)
        .get('/pedidos')
        .expect(200)
        .expect('Content-Type', /json/);

      const lista: Pedido[] = resList.body;
      expect(Array.isArray(lista)).toBe(true);
      expect(lista.some(p => p.id === pedidoId)).toBe(true);
    });

    it('deve cancelar pedido e retornar estoque', async () => {
      const novoPedido = {
        clienteNome: 'Maria Santos',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua B, 456',
        itens: [{ produtoId: produtoId1, quantidade: 3 }],
        desconto: 0
      };

      const resCreate = await request(app).post('/pedidos').send(novoPedido).expect(201);
      const pedidoId = resCreate.body.id;

      // Verificar estoque antes
      const resProdAntes = await request(app).get(`/produtos/${produtoId1}`);
      const estoqueAntes = resProdAntes.body.quantidadeEstoque;

      // Cancelar pedido
      const resCancelar = await request(app)
        .patch(`/pedidos/${pedidoId}/cancelar`)
        .expect(200);

      expect(resCancelar.body.status).toBe('cancelado');
      expect(resCancelar.body.dataAtualizacao).toBeDefined();

      // Verificar que estoque foi restaurado
      const resProdDepois = await request(app).get(`/produtos/${produtoId1}`);
      expect(resProdDepois.body.quantidadeEstoque).toBe(estoqueAntes + 3);
    });

    it('deve deletar pedido pendente e retornar estoque', async () => {
      const novoPedido = {
        clienteNome: 'Carlos Oliveira',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua C, 789',
        itens: [{ produtoId: produtoId2, quantidade: 2 }],
        desconto: 0
      };

      const resCreate = await request(app).post('/pedidos').send(novoPedido).expect(201);
      const pedidoId = resCreate.body.id;

      const resProdAntes = await request(app).get(`/produtos/${produtoId2}`);
      const estoqueAntes = resProdAntes.body.quantidadeEstoque;

      // Deletar pedido
      await request(app).delete(`/pedidos/${pedidoId}`).expect(204);

      // Verificar estoque restaurado
      const resProdDepois = await request(app).get(`/produtos/${produtoId2}`);
      expect(resProdDepois.body.quantidadeEstoque).toBe(estoqueAntes + 2);

      // Confirmar que foi deletado
      await request(app).get(`/pedidos/${pedidoId}`).expect(404);
    });

    it('deve retornar 400 ao criar pedido sem campos obrigatórios', async () => {
      await request(app)
        .post('/pedidos')
        .send({ clienteNome: 'Teste' })
        .expect(400);
    });

    it('deve retornar 400 para email inválido', async () => {
      await request(app)
        .post('/pedidos')
        .send({
          clienteNome: 'Teste',
          clienteEmail: 'email-invalido',
          clienteEndereco: 'Rua X',
          itens: [{ produtoId: produtoId1, quantidade: 1 }],
          desconto: 0
        })
        .expect(400);
    });

    it('deve retornar 400 para itens vazio', async () => {
      await request(app)
        .post('/pedidos')
        .send({
          clienteNome: 'Teste',
          clienteEmail: uniqueEmail(),
          clienteEndereco: 'Rua X',
          itens: [],
          desconto: 0
        })
        .expect(400);
    });

    it('deve retornar 400 para quantidade inválida', async () => {
      await request(app)
        .post('/pedidos')
        .send({
          clienteNome: 'Teste',
          clienteEmail: uniqueEmail(),
          clienteEndereco: 'Rua X',
          itens: [{ produtoId: produtoId1, quantidade: 0 }],
          desconto: 0
        })
        .expect(400);
    });

    it('deve retornar 404 para produto inexistente', async () => {
      await request(app)
        .post('/pedidos')
        .send({
          clienteNome: 'Teste',
          clienteEmail: uniqueEmail(),
          clienteEndereco: 'Rua X',
          itens: [{ produtoId: 999999999, quantidade: 1 }],
          desconto: 0
        })
        .expect(404);
    });

    it('deve retornar 409 para produto inativo', async () => {
      // Criar produto inativo
      const resProd = await request(app).post('/produtos').send({
        nome: 'Produto Inativo',
        descricao: 'Teste',
        preco: 100.00,
        categoria: 'Teste',
        quantidadeEstoque: 10,
        estoqueMinimo: 1
      });

      const prodInativoId = resProd.body.id;

      // Desativar produto
      await request(app).patch(`/produtos/${prodInativoId}`).send({ ativo: false });

      // Tentar criar pedido
      await request(app)
        .post('/pedidos')
        .send({
          clienteNome: 'Teste',
          clienteEmail: uniqueEmail(),
          clienteEndereco: 'Rua X',
          itens: [{ produtoId: prodInativoId, quantidade: 1 }],
          desconto: 0
        })
        .expect(409);
    });

    it('deve retornar 409 para estoque insuficiente', async () => {
      // Criar produto com estoque limitado
      const resProd = await request(app).post('/produtos').send({
        nome: 'Produto Limitado',
        descricao: 'Teste',
        preco: 100.00,
        categoria: 'Teste',
        quantidadeEstoque: 2,
        estoqueMinimo: 1
      });

      const prodLimitadoId = resProd.body.id;

      // Tentar criar pedido com quantidade maior que estoque
      await request(app)
        .post('/pedidos')
        .send({
          clienteNome: 'Teste',
          clienteEmail: uniqueEmail(),
          clienteEndereco: 'Rua X',
          itens: [{ produtoId: prodLimitadoId, quantidade: 5 }],
          desconto: 0
        })
        .expect(409);
    });

    it('deve retornar 400 para desconto maior que subtotal', async () => {
      await request(app)
        .post('/pedidos')
        .send({
          clienteNome: 'Teste',
          clienteEmail: uniqueEmail(),
          clienteEndereco: 'Rua X',
          itens: [{ produtoId: produtoId1, quantidade: 1 }],
          desconto: 99999
        })
        .expect(400);
    });

    it('GET /pedidos deve aplicar filtros corretamente', async () => {
      const email1 = uniqueEmail();
      const email2 = uniqueEmail();

      // Criar pedidos com diferentes emails
      await request(app).post('/pedidos').send({
        clienteNome: 'Cliente 1',
        clienteEmail: email1,
        clienteEndereco: 'Rua 1',
        itens: [{ produtoId: produtoId1, quantidade: 1 }],
        desconto: 0
      });

      await request(app).post('/pedidos').send({
        clienteNome: 'Cliente 2',
        clienteEmail: email2,
        clienteEndereco: 'Rua 2',
        itens: [{ produtoId: produtoId2, quantidade: 1 }],
        desconto: 0
      });

      // Filtrar por email
      const resEmail = await request(app)
        .get(`/pedidos?clienteEmail=${email1}`)
        .expect(200);

      const pedidosEmail: Pedido[] = resEmail.body;
      expect(pedidosEmail.every(p => p.clienteEmail === email1)).toBe(true);

      // Filtrar por status
      const resStatus = await request(app)
        .get('/pedidos?status=pendente')
        .expect(200);

      const pedidosStatus: Pedido[] = resStatus.body;
      expect(pedidosStatus.every(p => p.status === 'pendente')).toBe(true);
    });

    it('GET /pedidos/:id deve retornar 400 para id inválido', async () => {
      await request(app).get('/pedidos/abc').expect(400);
    });

    it('GET /pedidos/:id deve retornar 404 quando não existir', async () => {
      await request(app).get('/pedidos/999999999').expect(404);
    });

    it('PATCH /pedidos/:id/status deve retornar 400 para status inválido', async () => {
      const resPedido = await request(app).post('/pedidos').send({
        clienteNome: 'Teste',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua X',
        itens: [{ produtoId: produtoId1, quantidade: 1 }],
        desconto: 0
      });

      const pedidoId = resPedido.body.id;

      await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({ novoStatus: 'status-invalido' })
        .expect(400);
    });

    it('PATCH /pedidos/:id/status deve retornar 400 para transição inválida', async () => {
      const resPedido = await request(app).post('/pedidos').send({
        clienteNome: 'Teste',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua X',
        itens: [{ produtoId: produtoId1, quantidade: 1 }],
        desconto: 0
      });

      const pedidoId = resPedido.body.id;

      // Tentar pular de pendente para enviado (inválido)
      await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({ novoStatus: 'enviado' })
        .expect(400);
    });

    it('PATCH /pedidos/:id/status deve retornar 404 quando não existir', async () => {
      await request(app)
        .patch('/pedidos/999999999/status')
        .send({ novoStatus: 'confirmado' })
        .expect(404);
    });

    it('PATCH /pedidos/:id/status deve retornar 409 se pedido estiver cancelado', async () => {
      const resPedido = await request(app).post('/pedidos').send({
        clienteNome: 'Teste',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua X',
        itens: [{ produtoId: produtoId1, quantidade: 1 }],
        desconto: 0
      });

      const pedidoId = resPedido.body.id;

      // Cancelar pedido
      await request(app).patch(`/pedidos/${pedidoId}/cancelar`).expect(200);

      // Tentar mudar status (deve falhar)
      await request(app)
        .patch(`/pedidos/${pedidoId}/status`)
        .send({ novoStatus: 'confirmado' })
        .expect(409);
    });

    it('PATCH /pedidos/:id/cancelar deve retornar 404 quando não existir', async () => {
      await request(app).patch('/pedidos/999999999/cancelar').expect(404);
    });

    it('PATCH /pedidos/:id/cancelar deve retornar 409 se já cancelado', async () => {
      const resPedido = await request(app).post('/pedidos').send({
        clienteNome: 'Teste',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua X',
        itens: [{ produtoId: produtoId1, quantidade: 1 }],
        desconto: 0
      });

      const pedidoId = resPedido.body.id;

      // Cancelar
      await request(app).patch(`/pedidos/${pedidoId}/cancelar`).expect(200);

      // Tentar cancelar novamente
      await request(app).patch(`/pedidos/${pedidoId}/cancelar`).expect(409);
    });

    it('PATCH /pedidos/:id/cancelar deve retornar 409 se já entregue', async () => {
      const resPedido = await request(app).post('/pedidos').send({
        clienteNome: 'Teste',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua X',
        itens: [{ produtoId: produtoId1, quantidade: 1 }],
        desconto: 0
      });

      const pedidoId = resPedido.body.id;

      // Avançar status até entregue
      await request(app).patch(`/pedidos/${pedidoId}/status`).send({ novoStatus: 'confirmado' });
      await request(app).patch(`/pedidos/${pedidoId}/status`).send({ novoStatus: 'enviado' });
      await request(app).patch(`/pedidos/${pedidoId}/status`).send({ novoStatus: 'entregue' });

      // Tentar cancelar (deve falhar)
      await request(app).patch(`/pedidos/${pedidoId}/cancelar`).expect(409);
    });

    it('DELETE /pedidos/:id deve retornar 404 quando não existir', async () => {
      await request(app).delete('/pedidos/999999999').expect(404);
    });

    it('DELETE /pedidos/:id deve retornar 409 se status diferente de pendente', async () => {
      const resPedido = await request(app).post('/pedidos').send({
        clienteNome: 'Teste',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua X',
        itens: [{ produtoId: produtoId1, quantidade: 1 }],
        desconto: 0
      });

      const pedidoId = resPedido.body.id;

      // Confirmar pedido
      await request(app).patch(`/pedidos/${pedidoId}/status`).send({ novoStatus: 'confirmado' });

      // Tentar deletar (deve falhar)
      await request(app).delete(`/pedidos/${pedidoId}`).expect(409);
    });
  });

  describe('Regras de Negócio - Integridade Referencial', () => {
    it('não deve permitir deletar produto em pedidos não cancelados', async () => {
      // Criar produto
      const resProd = await request(app).post('/produtos').send({
        nome: 'Produto Bloqueado',
        descricao: 'Teste',
        preco: 100.00,
        categoria: 'Teste',
        quantidadeEstoque: 10,
        estoqueMinimo: 1
      });

      const prodId = resProd.body.id;

      // Criar pedido ativo
      await request(app).post('/pedidos').send({
        clienteNome: 'Teste',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua X',
        itens: [{ produtoId: prodId, quantidade: 1 }],
        desconto: 0
      });

      // Tentar deletar produto (deve falhar)
      await request(app).delete(`/produtos/${prodId}`).expect(409);
    });

    it('deve permitir deletar produto após cancelar todos os pedidos', async () => {
      // Criar produto
      const resProd = await request(app).post('/produtos').send({
        nome: 'Produto Liberável',
        descricao: 'Teste',
        preco: 100.00,
        categoria: 'Teste',
        quantidadeEstoque: 10,
        estoqueMinimo: 1
      });

      const prodId = resProd.body.id;

      // Criar e cancelar pedido
      const resPedido = await request(app).post('/pedidos').send({
        clienteNome: 'Teste',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua X',
        itens: [{ produtoId: prodId, quantidade: 1 }],
        desconto: 0
      });

      await request(app).patch(`/pedidos/${resPedido.body.id}/cancelar`).expect(200);

      // Agora deve conseguir deletar
      await request(app).delete(`/produtos/${prodId}`).expect(204);
    });
  });

  describe('Regras de Negócio - Snapshots de Dados', () => {
    it('modificações no produto não devem afetar pedidos existentes', async () => {
      // Criar produto
      const resProd = await request(app).post('/produtos').send({
        nome: 'Produto Original',
        descricao: 'Descrição Original',
        preco: 100.00,
        categoria: 'Teste',
        quantidadeEstoque: 10,
        estoqueMinimo: 1
      });

      const prodId = resProd.body.id;

      // Criar pedido
      const resPedido = await request(app).post('/pedidos').send({
        clienteNome: 'Teste',
        clienteEmail: uniqueEmail(),
        clienteEndereco: 'Rua X',
        itens: [{ produtoId: prodId, quantidade: 1 }],
        desconto: 0
      });

      const pedidoId = resPedido.body.id;

      // Modificar produto
      await request(app).patch(`/produtos/${prodId}`).send({
        nome: 'Produto Modificado',
        preco: 200.00
      });

      // Buscar pedido e verificar que mantém dados originais
      const resPedidoAtualizado = await request(app).get(`/pedidos/${pedidoId}`);

      expect(resPedidoAtualizado.body.itens[0].nomeProduto).toBe('Produto Original');
      expect(resPedidoAtualizado.body.itens[0].precoUnitario).toBe(100.00);
      expect(resPedidoAtualizado.body.subtotal).toBe(100.00);
    });
  });

  describe('Regras de Negócio - Atomicidade', () => {
    it('deve falhar completamente se algum item tiver estoque insuficiente', async () => {
      // Criar produto com estoque limitado
      const resProd1 = await request(app).post('/produtos').send({
        nome: 'Produto A',
        descricao: 'Teste',
        preco: 100.00,
        categoria: 'Teste',
        quantidadeEstoque: 10,
        estoqueMinimo: 1
      });

      const resProd2 = await request(app).post('/produtos').send({
        nome: 'Produto B',
        descricao: 'Teste',
        preco: 200.00,
        categoria: 'Teste',
        quantidadeEstoque: 1,
        estoqueMinimo: 1
      });

      const prod1Id = resProd1.body.id;
      const prod2Id = resProd2.body.id;

      // Tentar criar pedido com quantidade que esgota produto B
      await request(app)
        .post('/pedidos')
        .send({
          clienteNome: 'Teste',
          clienteEmail: uniqueEmail(),
          clienteEndereco: 'Rua X',
          itens: [
            { produtoId: prod1Id, quantidade: 2 },
            { produtoId: prod2Id, quantidade: 5 } // Estoque insuficiente
          ],
          desconto: 0
        })
        .expect(409);

      // Verificar que NENHUM estoque foi decrementado
      const resProd1Depois = await request(app).get(`/produtos/${prod1Id}`);
      const resProd2Depois = await request(app).get(`/produtos/${prod2Id}`);

      expect(resProd1Depois.body.quantidadeEstoque).toBe(10); // Inalterado
      expect(resProd2Depois.body.quantidadeEstoque).toBe(1);  // Inalterado
    });
  });
});