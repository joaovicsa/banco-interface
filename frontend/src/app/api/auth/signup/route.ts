/**
 * @file api/auth/signup
 * @description Endpoint responsável por registrar novos usuários.
 * Utiliza Prisma como ORM e bcrypt para criptografar a senha antes de salvar no banco.
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * @function POST
 * @async
 * @description Função que trata requisições POST para criação de conta de usuário.
 * Verifica se os campos obrigatórios foram preenchidos, se o e-mail já está cadastrado,
 * e cria um novo perfil com senha criptografada.
 *
 * @param {Request} req - Objeto da requisição contendo `email`, `password` e `name` no corpo.
 * @returns {Promise<NextResponse>} Resposta JSON com mensagem de sucesso e ID do novo usuário ou erro.
 *
 * @throws {Error} Retorna erro 400 se campos estiverem ausentes ou se o usuário já existir.
 * Retorna erro 500 em caso de falha interna no servidor.
 */

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existing = await prisma.profiles.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 10);

        // Exemplo no signup handler
        const newUser = await prisma.profiles.create({
            data: {
                id: crypto.randomUUID(),
                email,
                password: hashed,
                name,
                balance: 0,
            },
        });

        return NextResponse.json({ message: "Account created successfully", id: newUser.id }, { status: 201 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
