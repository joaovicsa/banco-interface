// src/pages/api/transactions/reverse.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
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