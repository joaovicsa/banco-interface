/**
 * @file api/auth/login
 * @description Endpoint de autenticação de usuários via e-mail e senha.
 * Utiliza Prisma como ORM, bcrypt para verificação de senha e JWT para geração de token.
 * O token é armazenado em cookie HTTP-only.
 */


import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!;


/**
 * @function POST
 * @async
 * @description Função que trata requisições POST para autenticação de usuários.
 * Recebe e-mail e senha, valida credenciais e retorna informações do perfil junto com um token JWT.
 *
 * @param {Request} req - Objeto da requisição contendo o corpo com `email` e `password`.
 * @returns {Promise<NextResponse>} Resposta JSON com dados do usuário autenticado ou erro.
 *
 * @throws {Error} Retorna erro 401 se as credenciais forem inválidas.
 * Retorna erro 500 em caso de falha interna no servidor.
 */

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const { email, password } = await req.json();

        const profile = await prisma.profiles.findUnique({ where: { email } });
        if (!profile) {
            return NextResponse.json({ error: "Credenciais Invalidas" }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, profile.password);
        if (!valid) {
            return NextResponse.json({ error: "Credenciais Invalidas" }, { status: 401 });
        }

        const token = jwt.sign({ id: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: "7d" });

        const res = NextResponse.json({
            message: "Login Realizado com Sucesso",
            id: profile.id,
            name: profile.name,
            email: profile.email,
        });

        res.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 dias
        });

        return res;
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erro de Servidor" }, { status: 500 });
    }
}
