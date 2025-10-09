/**
 * @file api/deposit
 * @description Endpoint responsável por realizar depósitos na conta de um usuário.
 * Atualiza o saldo e registra a transação no histórico.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @function POST
 * @async
 * @description Função que trata requisições POST para depósito de valores.
 * Valida os dados recebidos, atualiza o saldo do usuário e registra a transação.
 *
 * @param {NextRequest} req - Objeto da requisição contendo `userId` e `amount` no corpo.
 * @returns {Promise<NextResponse>} Resposta JSON com novo saldo ou mensagem de erro.
 *
 * @throws {Error} Retorna erro 400 se os dados forem inválidos.
 * Retorna erro 404 se o usuário não for encontrado.
 * Retorna erro 500 em caso de falha interna no servidor.
 */

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { userId, amount } = await req.json();

        if (!userId || amount <= 0) {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        const user = await prisma.profiles.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        const newBalance = user.balance + amount;

        await prisma.profiles.update({
            where: { id: userId },
            data: { balance: newBalance },
        });

        await prisma.transactions.create({
            data: {
                user_id: userId,
                type: "deposit",
                amount,
                balance_after: newBalance,
                description: "Depósito realizado",
            },
        });

        return NextResponse.json({ success: true, newBalance });
    } catch (error) {
        console.error("Erro no depósito:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}