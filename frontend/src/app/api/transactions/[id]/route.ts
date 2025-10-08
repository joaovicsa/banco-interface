import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const transactionId = BigInt(params.id);

        const transaction = await prisma.transactions.findUnique({
            where: { id: transactionId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        balance: true,
                    },
                },
                related: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                transactions: {
                    select: {
                        id: true,
                        amount: true,
                        type: true,
                    },
                },
            },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
        }

        return NextResponse.json({ transaction });
    } catch (error) {
        console.error("Erro ao buscar transação:", error);
        return NextResponse.json({ error: "Erro interno ao buscar transação" }, { status: 500 });
    }
}
