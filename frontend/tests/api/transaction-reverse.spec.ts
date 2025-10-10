import { POST } from "@/app/api/transactions/reverse/route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { describe, it, expect, vi, beforeEach, Mock } from "vitest"

vi.mock("@/lib/prisma", () => ({
    prisma: {
        profiles: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        transactions: {
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}))

describe("POST /api/transactions/reverse", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockRequest = (body: any) =>
        ({ json: vi.fn().mockResolvedValue(body) } as unknown as NextRequest)

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // --- Teste 1: Usuário não encontrado ---
    it("retorna 404 se o usuário não for encontrado", async () => {
        ; (prisma.profiles.findUnique as Mock).mockResolvedValueOnce(null)

        const req = mockRequest({
            userId: "123",
            transactionId: "999",
            originalAmount: 100,
            transactionType: "deposit",
        })
        const res = await POST(req)

        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({ error: "Usuário não encontrado" })
    })

    // --- Teste 2: Reversão de depósito ---
    it("reverte depósito subtraindo o saldo", async () => {
        ; (prisma.profiles.findUnique as Mock).mockResolvedValueOnce({
            id: "123",
            balance: 1000,
        })

        const req = mockRequest({
            userId: "123",
            transactionId: "111",
            originalAmount: 200,
            transactionType: "deposit",
        })

        const res = await POST(req)
        const json = await res.json()

        expect(prisma.profiles.update).toHaveBeenCalledWith({
            where: { id: "123" },
            data: { balance: 800 },
        })

        expect(prisma.transactions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    amount: BigInt(200),
                    balance_after: BigInt(800),
                    reversal_of: BigInt(111),
                    type: "reversal",
                    user_id: "123",
                }),
            })
        )

        expect(prisma.transactions.update).toHaveBeenCalledWith({
            where: { id: BigInt(111) },
            data: { reversed: true },
        })

        expect(json).toEqual({ success: true })
        expect(res.status).toBe(200)
    })

    // --- Teste 3: Reversão de transferência enviada ---
    it("reverte transferência enviada adicionando saldo", async () => {
        ; (prisma.profiles.findUnique as Mock).mockResolvedValueOnce({
            id: "123",
            balance: 500,
        })

        const req = mockRequest({
            userId: "123",
            transactionId: "222",
            originalAmount: 100,
            transactionType: "transfer_sent",
        })

        const res = await POST(req)
        const json = await res.json()

        expect(prisma.profiles.update).toHaveBeenCalledWith({
            where: { id: "123" },
            data: { balance: 600 },
        })
        expect(json).toEqual({ success: true })
    })

    // --- Teste 4: Reversão de transferência recebida ---
    it("reverte transferência recebida subtraindo saldo", async () => {
        ; (prisma.profiles.findUnique as Mock).mockResolvedValueOnce({
            id: "123",
            balance: 400,
        })

        const req = mockRequest({
            userId: "123",
            transactionId: "333",
            originalAmount: 50,
            transactionType: "transfer_received",
        })

        const res = await POST(req)
        const json = await res.json()

        expect(prisma.profiles.update).toHaveBeenCalledWith({
            where: { id: "123" },
            data: { balance: 350 },
        })
        expect(json).toEqual({ success: true })
    })

    // --- Teste 5: Erro interno ---
    it("retorna 500 em caso de erro interno", async () => {
        ; (prisma.profiles.findUnique as Mock).mockRejectedValueOnce(new Error("DB error"))

        const req = mockRequest({
            userId: "123",
            transactionId: "444",
            originalAmount: 100,
            transactionType: "deposit",
        })
        const res = await POST(req)

        expect(res.status).toBe(500)
        expect(await res.json()).toEqual({ error: "Erro interno" })
    })
})
