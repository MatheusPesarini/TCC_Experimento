// filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\GPT-5\task3\src\routes\products.ts
import { Router, Request, Response } from 'express';
import { produtos, pedidos, nextProdutoId } from '../data/store.js';
import { Produto } from '../types.js';
import { parseIdParam, round2, validateProdutoPatch, validateProdutoPost, produtoEmPedidosNaoCancelados } from '../utils/validation.js';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const err = validateProdutoPost(req.body);
  if (err) return res.status(400).json({ error: err });
  const { nome, descricao, preco, categoria, quantidadeEstoque, estoqueMinimo } = req.body;
  const produto: Produto = {
    id: nextProdutoId(),
    nome: nome.trim(),
    descricao: descricao.trim(),
    preco: round2(preco),
    categoria: categoria.trim(),
    quantidadeEstoque,
    estoqueMinimo,
    ativo: true,
    dataDeCadastro: new Date().toISOString()
  };
  produtos.push(produto);
  return res.status(201).json(produto);
});

router.get('/', (req: Request, res: Response) => {
  let result = [...produtos];
  const { categoria, ativo } = req.query;
  if (categoria && typeof categoria === 'string') {
    result = result.filter(p => p.categoria === categoria);
  }
  if (ativo === 'true') {
    result = result.filter(p => p.ativo);
  } else if (ativo === 'false') {
    result = result.filter(p => !p.ativo);
  }
  return res.json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });
  const produto = produtos.find(p => p.id === id);
  if (!produto) return res.status(404).json({ error: 'não encontrado' });
  return res.json(produto);
});

router.patch('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });
  const produto = produtos.find(p => p.id === id);
  if (!produto) return res.status(404).json({ error: 'não encontrado' });
  const err = validateProdutoPatch(req.body);
  if (err) return res.status(400).json({ error: err });
  const { nome, descricao, preco, categoria, quantidadeEstoque, estoqueMinimo, ativo } = req.body;
  if (nome !== undefined) produto.nome = nome.trim();
  if (descricao !== undefined) produto.descricao = descricao.trim();
  if (preco !== undefined) produto.preco = round2(preco);
  if (categoria !== undefined) produto.categoria = categoria.trim();
  if (quantidadeEstoque !== undefined) produto.quantidadeEstoque = quantidadeEstoque;
  if (estoqueMinimo !== undefined) produto.estoqueMinimo = estoqueMinimo;
  if (ativo !== undefined) produto.ativo = ativo;
  return res.json(produto);
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });
  const idx = produtos.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'não encontrado' });
  if (produtoEmPedidosNaoCancelados(id, pedidos)) {
    return res.status(409).json({ error: 'produto em pedidos ativos' });
  }
  produtos.splice(idx, 1);
  return res.status(204).send();
});

export default router;
