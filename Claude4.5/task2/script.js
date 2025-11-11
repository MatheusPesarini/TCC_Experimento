import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 10,           // número de usuários virtuais
    duration: "30s",   // tempo total do teste
};

// Permitir configurar via variável de ambiente do k6: -e BASE_URL=http://host:porta
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
    const headers = { "Content-Type": "application/json" };

    // 1) Criar livro
    const livroPayload = JSON.stringify({
        titulo: `Livro-${Math.random().toString(36).substring(7)}`,
        autor: `Autor ${Math.floor(Math.random() * 1000)}`,
        isbn: `${Math.floor(100 + Math.random() * 900)}-${Math.floor(1 + Math.random() * 9)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1 + Math.random() * 9)}`,
        quantidadeTotal: Math.floor(1 + Math.random() * 10)
    });

    let res = http.post(`${BASE_URL}/livros`, livroPayload, { headers });
    check(res, {
        "createLivro status 201": (r) => r.status === 201,
    });

    const livro = res.json();
    const livroId = livro?.id;

    // 2) Buscar todos os livros
    res = http.get(`${BASE_URL}/livros`);
    check(res, {
        "getAllLivros status 200": (r) => r.status === 200,
    });

    // 3) Buscar livro por ID
    if (livroId) {
        res = http.get(`${BASE_URL}/livros/${livroId}`);
        check(res, {
            "getLivroById status 200": (r) => r.status === 200,
        });

        // 4) Criar empréstimo
        const emprestimoPayload = JSON.stringify({
            livroId: livroId,
            nomeUsuario: `Usuario ${Math.floor(Math.random() * 1000)}`,
            emailUsuario: `user${Math.floor(Math.random() * 10000)}@test.com`,
            dataEmprestimo: new Date().toISOString()
        });

        res = http.post(`${BASE_URL}/emprestimos`, emprestimoPayload, { headers });
        check(res, {
            "createEmprestimo status 201": (r) => r.status === 201,
        });

        const emprestimo = res.json();
        const emprestimoId = emprestimo?.id;

        // 5) Buscar todos empréstimos
        res = http.get(`${BASE_URL}/emprestimos`);
        check(res, {
            "getAllEmprestimos status 200": (r) => r.status === 200,
        });

        // 6) Devolver empréstimo
        if (emprestimoId) {
            res = http.patch(`${BASE_URL}/emprestimos/${emprestimoId}/devolver`, null, { headers });
            check(res, {
                "devolverEmprestimo status 200": (r) => r.status === 200,
            });
        }

        // 7) Atualizar livro
        const updateLivroPayload = JSON.stringify({ titulo: "Livro Atualizado" });
        res = http.patch(`${BASE_URL}/livros/${livroId}`, updateLivroPayload, { headers });
        check(res, {
            "updateLivro status 200": (r) => r.status === 200,
        });

        // 8) Deletar livro
        res = http.del(`${BASE_URL}/livros/${livroId}`);
        check(res, {
            "deleteLivro status 204": (r) => r.status === 204,
        });
    }

    sleep(1);
}
