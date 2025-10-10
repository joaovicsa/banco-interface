import { POST } from "@/app/api/deposit/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        profiles: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        transactions: {
            create: vi.fn(),
        },
    },
}));

describe("POST /api/deposit", () => {
    const mockJson = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockRequest = (body: any) =>
        ({ json: vi.fn().mockResolvedValue(body) } as unknown as NextRequest);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("retorna 400 se os dados forem inválidos", async () => {
        const req = mockRequest({ userId: null, amount: -10 });
        const res = await POST(req);
        expect(await res.json()).toEqual({ error: "Dados inválidos" });
        expect(res.status).toBe(400);
    });

    it("retorna 404 se o usuário não for encontrado", async () => {
        (prisma.profiles.findUnique as Mock).mockResolvedValue(null);
        const req = mockRequest({ userId: "123", amount: 100 });
        const res = await POST(req);
        expect(await res.json()).toEqual({ error: "Usuário não encontrado" });
        expect(res.status).toBe(404);
    });

    it("realiza depósito e retorna novo saldo", async () => {
        (prisma.profiles.findUnique as Mock).mockResolvedValue({ id: "123", balance: 500 });
        (prisma.profiles.update as Mock).mockResolvedValue({});
        (prisma.transactions.create as Mock).mockResolvedValue({});

        const req = mockRequest({ userId: "123", amount: 100 });
        const res = await POST(req);
        const json = await res.json();

        expect(json).toEqual({ success: true, newBalance: 600 });
        expect(res.status).toBe(200);
    });

    it("retorna 500 em caso de erro interno", async () => {
        (prisma.profiles.findUnique as Mock).mockRejectedValue(new Error("DB error"));
        const req = mockRequest({ userId: "123", amount: 100 });
        const res = await POST(req);
        expect(await res.json()).toEqual({ error: "Erro interno" });
        expect(res.status).toBe(500);
    });
});
