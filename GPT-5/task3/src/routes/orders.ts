// filepath: c:\Users\mathe\Área de Trabalho\TCC_Experimento\GPT-5\task3\src\routes\orders.ts
import { Router, Request, Response } from 'express';
import { produtos, pedidos, nextPedidoId } from '../data/store.js';
import { Pedido, ItemPedido, Produto } from '../types.js';
import { parseIdParam, round2, validatePedidoPost, validateNovoStatus, canTransition } from '../utils/validation.js';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const err = validatePedidoPost(req.body);
  if (err) return res.status(400).json({ error: err });
  const { clienteNome, clienteEmail, clienteEndereco, itens, desconto = 0 } = req.body as {
    clienteNome: string; clienteEmail: string; clienteEndereco: string; itens: { produtoId: number; quantidade: number; }[]; desconto?: number;
  };

  // Validar produtos e estoque (atomicidade)
  const produtosEnv: { produto: Produto; quantidade: number; }[] = [];
  for (const it of itens) {
    const prod = produtos.find(p => p.id === it.produtoId);
    if (!prod) return res.status(404).json({ error: 'produto inexistente' });
    if (!prod.ativo) return res.status(409).json({ error: 'produto inativo' });
    if (prod.quantidadeEstoque < it.quantidade) return res.status(409).json({ error: 'estoque insuficiente' });
    produtosEnv.push({ produto: prod, quantidade: it.quantidade });
  }

  // Calcular subtotais sem aplicar ainda descontos
  const itensPedido: ItemPedido[] = produtosEnv.map(entry => {
    const subtotalItem = round2(entry.produto.preco * entry.quantidade);
    return {
      produtoId: entry.produto.id,
      nomeProduto: entry.produto.nome,
      quantidade: entry.quantidade,
      precoUnitario: entry.produto.preco,
      subtotal: subtotalItem
    };
  });
  const subtotal = round2(itensPedido.reduce((acc, i) => acc + i.subtotal, 0));
  if (typeof desconto !== 'number' || desconto < 0 || desconto > subtotal) {
    return res.status(400).json({ error: 'desconto inválido' });
  }
  const total = round2(subtotal - desconto);

  // Reservar estoque (após todas validações)
  for (const { produto, quantidade } of produtosEnv) {
    produto.quantidadeEstoque -= quantidade; // garantido suficiente
  }

  const agora = new Date().toISOString();
  const pedido: Pedido = {
    id: nextPedidoId(),
    clienteNome: clienteNome.trim(),
    clienteEmail: clienteEmail.trim(),
    clienteEndereco: clienteEndereco.trim(),
    itens: itensPedido,
    subtotal,
    desconto: round2(desconto),
    total,
    status: 'pendente',
    dataDoPedido: agora,
    dataAtualizacao: agora
  };
  pedidos.push(pedido);
  return res.status(201).json(pedido);
});

router.get('/', (req: Request, res: Response) => {
  let result = [...pedidos];
  const { status, clienteEmail } = req.query;
  if (status && typeof status === 'string') {
    result = result.filter(p => p.status === status);
  }
  if (clienteEmail && typeof clienteEmail === 'string') {
    result = result.filter(p => p.clienteEmail === clienteEmail);
  }
  return res.json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return res.status(404).json({ error: 'não encontrado' });
  return res.json(pedido);
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return res.status(404).json({ error: 'não encontrado' });
  const { novoStatus } = req.body;
  if (!validateNovoStatus(novoStatus)) return res.status(400).json({ error: 'status inválido' });
  if (pedido.status === 'cancelado') return res.status(409).json({ error: 'pedido cancelado' });
  if (!canTransition(pedido.status, novoStatus)) return res.status(400).json({ error: 'transição inválida' });
  pedido.status = novoStatus;
  pedido.dataAtualizacao = new Date().toISOString();
  return res.json(pedido);
});

router.patch('/:id/cancelar', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return res.status(404).json({ error: 'não encontrado' });
  if (pedido.status === 'cancelado') return res.status(409).json({ error: 'já cancelado' });
  if (pedido.status === 'entregue') return res.status(409).json({ error: 'já entregue' });
  // Restaurar estoque
  for (const item of pedido.itens) {
    const prod = produtos.find(p => p.id === item.produtoId);
    if (prod) prod.quantidadeEstoque += item.quantidade;
  }
  pedido.status = 'cancelado';
  pedido.dataAtualizacao = new Date().toISOString();
  return res.json(pedido);
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });
  const idx = pedidos.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'não encontrado' });
  const pedido = pedidos[idx];
  if (pedido.status !== 'pendente') return res.status(409).json({ error: 'status não permite delete' });
  // Restaurar estoque
  for (const item of pedido.itens) {
    const prod = produtos.find(p => p.id === item.produtoId);
    if (prod) prod.quantidadeEstoque += item.quantidade;
  }
  pedidos.splice(idx, 1);
  return res.status(204).send();
});

export default router;
