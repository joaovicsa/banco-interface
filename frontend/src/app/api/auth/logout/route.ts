
/**
 * @file api/auth/logout
 * @description Endpoint responsável por realizar o logout do usuário.
 * Remove o token de autenticação armazenado em cookie HTTP-only.
 */

import { NextResponse } from "next/server";

/**
 * @function POST
 * @async
 * @description Função que trata requisições POST para logout de usuários.
 * Remove o cookie de autenticação (`auth-token`) e retorna uma mensagem de sucesso.
 *
 * @returns {Promise<NextResponse>} Resposta JSON indicando sucesso ou erro.
 *
 * @throws {Error} Retorna erro 500 em caso de falha interna no servidor.
 */

export async function POST(): Promise<NextResponse> {
    try {
        const res = NextResponse.json({ message: "Deslogado com Sucesso" });


        res.cookies.set("auth-token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            expires: new Date(0), // Expira imediatamente
        });

        return res;
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erro de Servidor" }, { status: 500 });
    }
}