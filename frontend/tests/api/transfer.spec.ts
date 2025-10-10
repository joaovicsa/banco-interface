import { POST } from "@/app/api/transfer/route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { describe, it, expect, beforeEach, vi, Mock } from "vitest"

// --- Mock do Prisma ---
vi.mock("@/lib/prisma", () => ({
    prisma: {
        profiles: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        transactions: {
            create: vi.fn(),
        },
        $transaction: vi.fn(async (actions: (() => Promise<void>)[]) => {
            // Executa todas as operações simuladas
            for (const action of actions) await action
        }),
    },
}))

describe("POST /api/transfer", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockRequest = (body: any) =>
        ({ json: vi.fn().mockResolvedValue(body) } as unknown as NextRequest)

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // --- Teste 1: Dados inválidos ---
    it("retorna 400 se os dados forem inválidos", async () => {
        const req = mockRequest({ userId: "123", userEmail: "a@a.com", recipientEmail: "b@b.com", amount: -50 })
        const res = await POST(req)
        expect(await res.json()).toEqual({ error: "Dados inválidos" })
        expect(res.status).toBe(400)
    })

    // --- Teste 2: Transferência para si mesmo ---
    it("retorna 400 se o usuário tentar transferir para si mesmo", async () => {
        const req = mockRequest({ userId: "123", userEmail: "a@a.com", recipientEmail: "a@a.com", amount: 100 })
        const res = await POST(req)
        expect(await res.json()).toEqual({ error: "Você não pode transferir para si mesmo." })
        expect(res.status).toBe(400)
    })

    // --- Teste 3: Remetente não encontrado ---
    it("retorna 404 se o remetente não for encontrado", async () => {
        ; (prisma.profiles.findUnique as Mock)
            .mockResolvedValueOnce(null) // sender
            .mockResolvedValueOnce({ id: "2", email: "b@b.com", balance: 500 }) // recipient

        const req = mockRequest({ userId: "123", userEmail: "a@a.com", recipientEmail: "b@b.com", amount: 100 })
        const res = await POST(req)
        expect(await res.json()).toEqual({ error: "Usuário remetente não encontrado." })
        expect(res.status).toBe(404)
    })

    // --- Teste 4: Destinatário não encontrado ---
    it("retorna 404 se o destinatário não for encontrado", async () => {
        ; (prisma.profiles.findUnique as Mock)
            .mockResolvedValueOnce({ id: "1", email: "a@a.com", balance: 1000 }) // sender
            .mockResolvedValueOnce(null) // recipient

        const req = mockRequest({ userId: "1", userEmail: "a@a.com", recipientEmail: "b@b.com", amount: 100 })
        const res = await POST(req)
        expect(await res.json()).toEqual({ error: "Usuário destinatário não encontrado." })
        expect(res.status).toBe(404)
    })

    // --- Teste 5: Saldo insuficiente ---
    it("retorna 400 se o saldo for insuficiente", async () => {
        ; (prisma.profiles.findUnique as Mock)
            .mockResolvedValueOnce({ id: "1", email: "a@a.com", balance: 50 }) // sender
            .mockResolvedValueOnce({ id: "2", email: "b@b.com", balance: 1000 }) // recipient

        const req = mockRequest({ userId: "1", userEmail: "a@a.com", recipientEmail: "b@b.com", amount: 100 })
        const res = await POST(req)
        expect(await res.json()).toEqual({ error: "Saldo insuficiente para realizar a transferência." })
        expect(res.status).toBe(400)
    })

    // --- Teste 6: Transferência bem-sucedida ---
    it("realiza transferência com sucesso", async () => {
        ; (prisma.profiles.findUnique as Mock)
            .mockResolvedValueOnce({ id: "1", email: "a@a.com", balance: 1000 }) // sender
            .mockResolvedValueOnce({ id: "2", email: "b@b.com", balance: 500 }) // recipient

            ; (prisma.$transaction as Mock).mockResolvedValueOnce(true)

        const req = mockRequest({ userId: "1", userEmail: "a@a.com", recipientEmail: "b@b.com", amount: 200 })
        const res = await POST(req)
        expect(await res.json()).toEqual({ success: true })
        expect(res.status).toBe(200)
    })

    // --- Teste 7: Erro interno ---
    it("retorna 500 em caso de erro interno", async () => {
        ; (prisma.profiles.findUnique as Mock).mockRejectedValueOnce(new Error("DB error"))

        const req = mockRequest({ userId: "1", userEmail: "a@a.com", recipientEmail: "b@b.com", amount: 100 })
        const res = await POST(req)
        expect(await res.json()).toEqual({ error: "Erro interno ao realizar transferência." })
        expect(res.status).toBe(500)
    })
})
