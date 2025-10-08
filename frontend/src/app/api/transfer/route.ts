// src/pages/api/transfer.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId, userEmail, recipientEmail, amount } = await req.json();

        if (!userId || !userEmail || !recipientEmail || amount <= 0) {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        if (recipientEmail === userEmail) {
            return NextResponse.json({ error: "Você não pode transferir para si mesmo." }, { status: 400 });
        }

        const sender = await prisma.profiles.findUnique({ where: { id: userId } });
        const recipient = await prisma.profiles.findUnique({ where: { email: recipientEmail } });

        if (!sender || !recipient) {
            return NextResponse.json({ error: "Usuário destinatário não encontrado." }, { status: 404 });
        }

        if (sender.balance < amount) {
            return NextResponse.json({ error: "Saldo insuficiente para realizar a transferência." }, { status: 400 });
        }

        const newSenderBalance = sender.balance - amount;
        const newRecipientBalance = recipient.balance + amount;

        await prisma.$transaction([
            prisma.profiles.update({
                where: { id: userId },
                data: { balance: newSenderBalance },
            }),
            prisma.profiles.update({
                where: { id: recipient.id },
                data: { balance: newRecipientBalance },
            }),
            prisma.transactions.create({
                data: {
                    user_id: userId,
                    type: "transfer_sent",
                    amount,
                    balance_after: newSenderBalance,
                    related_user_id: recipient.id,
                    description: `Transferência para ${recipientEmail}`,
                },
            }),
            prisma.transactions.create({
                data: {
                    user_id: recipient.id,
                    type: "transfer_received",
                    amount,
                    balance_after: newRecipientBalance,
                    related_user_id: userId,
                    description: `Transferência recebida de ${userEmail}`,
                },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro na transferência:", error);
        return NextResponse.json({ error: "Erro interno ao realizar transferência." }, { status: 500 });
    }
}