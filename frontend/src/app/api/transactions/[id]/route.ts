/**
 * @file api/transactions/[id]
 * @description Endpoint para consulta das últimas transações de um usuário.
 * Retorna até 50 transações ordenadas por data de criação (descendente), incluindo dados do usuário relacionado.
 * Utiliza Prisma como ORM e inclui tratamento para valores do tipo BigInt.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


/**
 * @function serializeBigInt
 * @description Utilitário para converter valores BigInt em strings compatíveis com JSON.
 *
 * @param {unknown} obj - Objeto que pode conter valores do tipo BigInt.
 * @returns {unknown} Objeto com BigInt convertido para string.
 */

function serializeBigInt(obj: unknown): unknown {
    return JSON.parse(
        JSON.stringify(obj, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    );
}

/**
 * @function GET
 * @async
 * @description Função que trata requisições GET para buscar transações de um usuário específico.
 * O ID do usuário é extraído da rota dinâmica `[id]`.
 *
 * @param {Request} req - Objeto da requisição HTTP.
 * @param {Object} context - Contexto da rota contendo os parâmetros.
 * @param {Promise<{ id: string }>} context.params - Parâmetros da rota, incluindo o `id` do usuário.
 *
 * @returns {Promise<NextResponse>} Resposta JSON contendo as transações e os nomes dos usuários relacionados.
 *
 * @throws {Error} Retorna erro 500 em caso de falha interna ao buscar transações.
 */

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

        return NextResponse.json(serializeBigInt({ transactions, relatedUsers }));
    } catch (error) {
        console.error("Erro ao buscar transações:", error);
        return NextResponse.json(
            { error: "Erro interno ao buscar transações" },
            { status: 500 }
        );
    }
}