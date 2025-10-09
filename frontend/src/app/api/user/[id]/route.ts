/**
 * @file api/user/[id]
 * @description Endpoint para consulta de dados de perfil e histórico de transações de um usuário.
 * Retorna até 50 transações mais recentes, incluindo informações de usuários relacionados.
 * Utiliza Prisma como ORM e inclui tratamento para valores do tipo BigInt.
 */

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
 * @description Função que trata requisições GET para buscar dados de um usuário específico.
 * O ID do usuário é extraído da rota dinâmica `[id]`.
 * Retorna dados de perfil e até 50 transações ordenadas por data de criação.
 *
 * @param {Request} req - Objeto da requisição HTTP.
 * @param {Object} context - Contexto da rota contendo os parâmetros.
 * @param {Promise<{ id: string }>} context.params - Parâmetros da rota, incluindo o `id` do usuário.
 *
 * @returns {Promise<NextResponse>} Resposta JSON contendo dados do usuário e transações.
 *
 * @throws {Error} Retorna erro 404 se o usuário não for encontrado.
 * Retorna erro 500 em caso de falha interna ao buscar os dados.
 */

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
