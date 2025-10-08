import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = context.params.id;

        const user = await prisma.profiles.findUnique({
            where: { id: userId },
            include: {
                transactions: {
                    orderBy: { created_at: "desc" },
                    take: 50,
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return NextResponse.json({ error: "Erro interno ao buscar usuário" }, { status: 500 });
    }
}
