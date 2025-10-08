import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId, userEmail, recipientEmail, amount } = await req.json();

        // Validação básica
        if (
            typeof userId !== "string" ||
            typeof userEmail !== "string" ||
            typeof recipientEmail !== "string" ||
            typeof amount !== "number" ||
            amount <= 0
        ) {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        if (recipientEmail === userEmail) {
            return NextResponse.json({ error: "Você não pode transferir para si mesmo." }, { status: 400 });
        }

        // Busca dos perfis
        const [sender, recipient] = await Promise.all([
            prisma.profiles.findUnique({ where: { id: userId } }),
            prisma.profiles.findUnique({ where: { email: recipientEmail } }),
        ]);

        if (!sender) {
            return NextResponse.json({ error: "Usuário remetente não encontrado." }, { status: 404 });
        }

        if (!recipient) {
            return NextResponse.json({ error: "Usuário destinatário não encontrado." }, { status: 404 });
        }

        if (sender.balance < amount) {
            return NextResponse.json({ error: "Saldo insuficiente para realizar a transferência." }, { status: 400 });
        }

        const newSenderBalance = sender.balance - amount;
        const newRecipientBalance = recipient.balance + amount;

        // Transação atômica
        await prisma.$transaction([
            prisma.profiles.update({
                where: { id: sender.id },
                data: { balance: newSenderBalance },
            }),
            prisma.profiles.update({
                where: { id: recipient.id },
                data: { balance: newRecipientBalance },
            }),
            prisma.transactions.create({
                data: {
                    user_id: sender.id,
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
                    related_user_id: sender.id,
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
