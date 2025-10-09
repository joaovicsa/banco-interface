import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

        const user = await prisma.profiles.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                balance: true,
                transactions: {
                    orderBy: { created_at: "desc" },
                    take: 50,
                    select: {
                        id: true,
                        amount: true,
                        balance_after: true,
                        description: true,
                        type: true,
                        created_at: true,
                        reversed: true,
                        related: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        return NextResponse.json(serializeBigInt(user));
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return NextResponse.json({ error: "Erro interno ao buscar usuário" }, { status: 500 });
    }
}
