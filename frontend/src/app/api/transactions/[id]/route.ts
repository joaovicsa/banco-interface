import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params; // ✅ await params
        const userId = id;

        const transactions = await prisma.transactions.findMany({
            where: { user_id: userId },
            orderBy: { created_at: "desc" },
            take: 50,
            include: {
                related: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        const relatedUsers: Record<string, string> = {};
        transactions.forEach((tx) => {
            if (tx.related_user_id && tx.related?.name) {
                relatedUsers[tx.related_user_id] = tx.related.name;
            }
        });

        return NextResponse.json({ transactions, relatedUsers });
    } catch (error) {
        console.error("Erro ao buscar transações:", error);
        return NextResponse.json({ error: "Erro interno ao buscar transações" }, { status: 500 });
    }
}
