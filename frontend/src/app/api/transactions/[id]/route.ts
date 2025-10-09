import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔧 Utility to convert BigInt values into strings (JSON-safe)
function serializeBigInt(obj: unknown): unknown {
    return JSON.parse(
        JSON.stringify(obj, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    );
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
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

        // ✅ Serialize BigInt values before returning
        return NextResponse.json(serializeBigInt({ transactions, relatedUsers }));
    } catch (error) {
        console.error("Erro ao buscar transações:", error);
        return NextResponse.json(
            { error: "Erro interno ao buscar transações" },
            { status: 500 }
        );
    }
}