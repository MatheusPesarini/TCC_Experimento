import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 10,           // número de usuários virtuais
    duration: "30s",   // tempo total do teste
};

// Permitir configurar via variável de ambiente do k6: -e BASE_URL=http://host:porta
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
    // 1) Criar usuário
    const payload = JSON.stringify({
        nome: `Usuário-${Math.random().toString(36).substring(7)}`,
        email: `email${Math.floor(Math.random() * 10000)}@teste.com`,
        senha: "SenhaSegura123"
    });

    const headers = { "Content-Type": "application/json" };
    let res = http.post(`${BASE_URL}/usuarios`, payload, { headers });

    check(res, {
        "createUser status 201": (r) => r.status === 201,
    });

    const user = res.json();
    const userId = user?.id;

    // 2) Buscar todos usuários
    res = http.get(`${BASE_URL}/usuarios`);
    check(res, {
        "getAllUsers status 200": (r) => r.status === 200,
    });

    // 3) Buscar usuário por ID (se criado com sucesso)
    if (userId) {
        res = http.get(`${BASE_URL}/usuarios/${userId}`);
        check(res, {
            "getUserById status 200": (r) => r.status === 200,
        });

        // 4) Atualizar usuário
        const updatePayload = JSON.stringify({ nome: "Usuário Atualizado" });
        res = http.patch(`${BASE_URL}/usuarios/${userId}`, updatePayload, { headers });
        check(res, {
            "updateUser status 200": (r) => r.status === 200,
        });

        // 5) Deletar usuário (sua API retorna 204)
        res = http.del(`${BASE_URL}/usuarios/${userId}`);
        check(res, {
            "deleteUser status 204": (r) => r.status === 204,
        });
    }

    sleep(1); // cada usuário espera 1s antes de repetir
}
