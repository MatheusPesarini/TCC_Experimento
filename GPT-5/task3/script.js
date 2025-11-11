import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 10,
    duration: "30s",
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const uniqueEmail = () => `cliente_${Date.now()}_${Math.random().toString(36).slice(2)}@loja.com`;

export default function () {
    const headers = { "Content-Type": "application/json" };

    // 1) Criar produto 1
    const produto1Payload = JSON.stringify({
        nome: `Mouse Gamer-${Math.random().toString(36).substring(7)}`,
        descricao: "Mouse RGB 16000 DPI",
        preco: 150.00,
        categoria: "Periféricos",
        quantidadeEstoque: 20,
        estoqueMinimo: 3
    });

    let res = http.post(`${BASE_URL}/produtos`, produto1Payload, { headers });
    check(res, {
        "createProduto1 status 201": (r) => r.status === 201,
    });

    const produto1 = res.json();
    const produtoId1 = produto1?.id;

    // 2) Criar produto 2
    const produto2Payload = JSON.stringify({
        nome: `Teclado Mecânico-${Math.random().toString(36).substring(7)}`,
        descricao: "Teclado RGB Switch Blue",
        preco: 350.00,
        categoria: "Periféricos",
        quantidadeEstoque: 15,
        estoqueMinimo: 2
    });

    res = http.post(`${BASE_URL}/produtos`, produto2Payload, { headers });
    check(res, {
        "createProduto2 status 201": (r) => r.status === 201,
    });

    const produto2 = res.json();
    const produtoId2 = produto2?.id;

    // 3) Buscar todos os produtos
    res = http.get(`${BASE_URL}/produtos`);
    check(res, {
        "getAllProdutos status 200": (r) => r.status === 200,
    });

    // 4) Buscar produto por ID
    if (produtoId1) {
        res = http.get(`${BASE_URL}/produtos/${produtoId1}`);
        check(res, {
            "getProdutoById status 200": (r) => r.status === 200,
        });

        // 5) Atualizar produto
        const updateProdutoPayload = JSON.stringify({ 
            preco: 140.00, 
            descricao: "Mouse RGB 16000 DPI - PROMOÇÃO" 
        });
        res = http.patch(`${BASE_URL}/produtos/${produtoId1}`, updateProdutoPayload, { headers });
        check(res, {
            "updateProduto status 200": (r) => r.status === 200,
        });
    }

    // 6) Criar pedido com ambos os produtos
    if (produtoId1 && produtoId2) {
        const pedidoPayload = JSON.stringify({
            clienteNome: `Cliente ${Math.floor(Math.random() * 1000)}`,
            clienteEmail: uniqueEmail(),
            clienteEndereco: `Rua ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 1000)}`,
            itens: [
                { produtoId: produtoId1, quantidade: 2 },
                { produtoId: produtoId2, quantidade: 1 }
            ],
            desconto: 50.00
        });

        res = http.post(`${BASE_URL}/pedidos`, pedidoPayload, { headers });
        check(res, {
            "createPedido status 201": (r) => r.status === 201,
        });

        const pedido = res.json();
        const pedidoId = pedido?.id;

        // 7) Buscar todos os pedidos
        res = http.get(`${BASE_URL}/pedidos`);
        check(res, {
            "getAllPedidos status 200": (r) => r.status === 200,
        });

        // 8) Buscar pedido por ID
        if (pedidoId) {
            res = http.get(`${BASE_URL}/pedidos/${pedidoId}`);
            check(res, {
                "getPedidoById status 200": (r) => r.status === 200,
            });

            // 9) Atualizar status do pedido (pendente → confirmado)
            res = http.patch(`${BASE_URL}/pedidos/${pedidoId}/status`, 
                JSON.stringify({ novoStatus: "confirmado" }), 
                { headers });
            check(res, {
                "updatePedidoStatus confirmado status 200": (r) => r.status === 200,
            });

            // 10) Atualizar status (confirmado → enviado)
            res = http.patch(`${BASE_URL}/pedidos/${pedidoId}/status`, 
                JSON.stringify({ novoStatus: "enviado" }), 
                { headers });
            check(res, {
                "updatePedidoStatus enviado status 200": (r) => r.status === 200,
            });

            // 11) Atualizar status (enviado → entregue)
            res = http.patch(`${BASE_URL}/pedidos/${pedidoId}/status`, 
                JSON.stringify({ novoStatus: "entregue" }), 
                { headers });
            check(res, {
                "updatePedidoStatus entregue status 200": (r) => r.status === 200,
            });
        }
    }

    // 12) Criar outro pedido para cancelar
    if (produtoId1) {
        const pedidoCancelarPayload = JSON.stringify({
            clienteNome: "Cliente Cancelamento",
            clienteEmail: uniqueEmail(),
            clienteEndereco: "Rua Teste, 123",
            itens: [{ produtoId: produtoId1, quantidade: 1 }],
            desconto: 0
        });

        res = http.post(`${BASE_URL}/pedidos`, pedidoCancelarPayload, { headers });
        const pedidoCancelar = res.json();
        const pedidoCancelarId = pedidoCancelar?.id;

        // 13) Cancelar pedido
        if (pedidoCancelarId) {
            res = http.patch(`${BASE_URL}/pedidos/${pedidoCancelarId}/cancelar`, null, { headers });
            check(res, {
                "cancelarPedido status 200": (r) => r.status === 200,
            });
        }
    }

    // 14) Criar pedido pendente para deletar
    if (produtoId2) {
        const pedidoDeletarPayload = JSON.stringify({
            clienteNome: "Cliente Deletar",
            clienteEmail: uniqueEmail(),
            clienteEndereco: "Rua Teste, 456",
            itens: [{ produtoId: produtoId2, quantidade: 1 }],
            desconto: 0
        });

        res = http.post(`${BASE_URL}/pedidos`, pedidoDeletarPayload, { headers });
        const pedidoDeletar = res.json();
        const pedidoDeletarId = pedidoDeletar?.id;

        // 15) Deletar pedido pendente
        if (pedidoDeletarId) {
            res = http.del(`${BASE_URL}/pedidos/${pedidoDeletarId}`);
            check(res, {
                "deletePedido status 204": (r) => r.status === 204,
            });
        }
    }

    // Nota: Não deletamos produtos porque podem estar em pedidos ativos
    // conforme regras de negócio da task3

    sleep(1);
}