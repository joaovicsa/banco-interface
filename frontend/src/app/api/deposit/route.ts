import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
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