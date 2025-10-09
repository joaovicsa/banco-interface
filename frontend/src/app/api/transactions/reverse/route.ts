/**
 * @file api/transactions/reverse
 * @description Endpoint responsável por reverter uma transação financeira.
 * Atualiza o saldo do usuário com base no tipo da transação original e registra a reversão no histórico.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


/**
 * @function POST
 * @async
 * @description Função que trata requisições POST para reversão de transações.
 * Recebe os dados da transação original, ajusta o saldo do usuário e marca a transação como revertida.
 *
 * @param {NextRequest} req - Objeto da requisição contendo `userId`, `transactionId`, `originalAmount` e `transactionType`.
 * @returns {Promise<NextResponse>} Resposta JSON indicando sucesso ou erro.
 *
 * @throws {Error} Retorna erro 404 se o usuário não for encontrado.
 * Retorna erro 500 em caso de falha interna no servidor.
 */

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { userId, transactionId, originalAmount, transactionType } = await req.json();

        const user = await prisma.profiles.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

        let newBalance = user.balance;

        if (transactionType === "deposit") newBalance -= originalAmount;
        else if (transactionType === "transfer_sent") newBalance += originalAmount;
        else if (transactionType === "transfer_received") newBalance -= originalAmount;

        await prisma.profiles.update({
            where: { id: userId },
            data: { balance: newBalance },
        });

        await prisma.transactions.create({
            data: {
                user_id: userId,
                type: "reversal",
                amount: originalAmount,
                balance_after: newBalance,
                description: "Reversão de transação",
                reversal_of: transactionId,
            },
        });

        await prisma.transactions.update({
            where: { id: BigInt(transactionId) },
            data: { reversed: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao reverter transação:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}