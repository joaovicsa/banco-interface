import { GET } from "@/app/api/transactions/[id]/route"
import { prisma } from "@/lib/prisma"
import { describe, it, expect, vi, beforeEach, Mock } from "vitest"

vi.mock("@/lib/prisma", () => ({
    prisma: {
        transactions: {
            findMany: vi.fn(),
        },
    },
}))

describe("GET /api/transactions/[id]", () => {
    const mockContext = (id: string) => ({
        params: Promise.resolve({ id }),
    })

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // --- Teste 1: Retorna lista de transações ---
    it("retorna até 50 transações ordenadas com usuários relacionados", async () => {
        const mockTransactions = [
            {
                id: 1,
                user_id: "123",
                type: "deposit",
                amount: 100,
                created_at: new Date("2024-01-01"),
                related_user_id: "456",
                related: { id: "456", name: "Maria", email: "maria@email.com" },
            },
            {
                id: 2,
                user_id: "123",
                type: "transfer_sent",
                amount: 50,
                created_at: new Date("2024-01-02"),
                related_user_id: "789",
                related: { id: "789", name: "João", email: "joao@email.com" },
            },
        ]

            ; (prisma.transactions.findMany as Mock).mockResolvedValue(mockTransactions)

        const res = await GET(new Request("http://localhost"), mockContext("123"))
        const json = await res.json()

        expect(prisma.transactions.findMany).toHaveBeenCalledWith({
            where: { user_id: "123" },
            orderBy: { created_at: "desc" },
            take: 50,
            include: {
                related: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        expect(json.transactions).toHaveLength(2)
        expect(json.relatedUsers).toEqual({
            "456": "Maria",
            "789": "João",
        })
    })

    // --- Teste 2: Erro interno ---
    it("retorna 500 se ocorrer erro interno", async () => {
        ; (prisma.transactions.findMany as Mock).mockRejectedValueOnce(new Error("DB error"))

        const res = await GET(new Request("http://localhost"), mockContext("123"))
        const json = await res.json()

        expect(res.status).toBe(500)
        expect(json).toEqual({ error: "Erro interno ao buscar transações" })
    })
})
