/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @file components/TransferDialog.tsx
 * @description Componente de diálogo para realizar transferências entre usuários da carteira digital.
 * Valida os dados inseridos, envia requisição à API e exibe mensagens de sucesso ou erro via toast.
 */

"use client";

import { JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/**
 * @type {Object} TransferDialogProps
 * @property {boolean} open - Define se o diálogo está visível.
 * @property {(open: boolean) => void} onOpenChange - Função para abrir ou fechar o diálogo.
 * @property {string} userId - ID do usuário que está realizando a transferência.
 * @property {number} currentBalance - Saldo atual do usuário.
 * @property {string} userEmail - E-mail do usuário remetente.
 * @property {() => void} onSuccess - Função chamada após transferência bem-sucedida.
 */
type TransferDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    currentBalance: number;
    userEmail: string;
    onSuccess: () => void;
}

/**
 * @component TransferDialog
 * @description Componente que exibe um modal para realizar transferências entre usuários.
 * Valida os dados, envia requisição à API e atualiza o estado da aplicação.
 *
 * @param {TransferDialogProps} props - Propriedades do componente.
 * @returns {JSX.Element} Elemento JSX do diálogo de transferência.
 */

const TransferDialog = ({
    open,
    onOpenChange,
    userId,
    currentBalance,
    userEmail,
    onSuccess,
}: TransferDialogProps): JSX.Element => {
    const [recipientEmail, setRecipientEmail] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    /**
         * @function handleTransfer
         * @description Valida os dados da transferência e envia requisição à API.
         * Exibe mensagens de erro ou sucesso via toast.
         */

    const handleTransfer = async () => {
        const transferAmount = parseFloat(amount);

        if (isNaN(transferAmount) || transferAmount <= 0) {
            toast.error("Valor inválido. Insira um valor válido para transferir.");
            return;
        }

        if (currentBalance < transferAmount) {
            toast.error("Saldo insuficiente para realizar esta transferência.");
            return;
        }

        if (recipientEmail === userEmail) {
            toast.error("Você não pode transferir para si mesmo.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    userEmail,
                    recipientEmail,
                    amount: transferAmount,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Erro ao realizar transferência.");
            } else {
                toast.success(
                    `Transferência realizada com sucesso! R$ ${transferAmount.toFixed(
                        2
                    )} enviado para ${recipientEmail}.`
                );
                setRecipientEmail("");
                setAmount("");
                onSuccess();
                onOpenChange(false);
            }
        } catch (err) {
            toast.error("Erro inesperado ao realizar transferência.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl shadow-lg border border-gray-100 bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Realizar Transferência
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Transfira dinheiro para outro usuário da carteira digital.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="recipient-email">Email do Destinatário</Label>
                        <Input
                            id="recipient-email"
                            type="email"
                            placeholder="destinatario@email.com"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            className="rounded-lg border-green-500 focus-visible:ring-green-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transfer-amount">Valor da Transferência</Label>
                        <Input
                            id="transfer-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="rounded-lg border-gray-300"
                        />
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Saldo disponível:{" "}
                        <span className="font-medium text-foreground">
                            R$ {(currentBalance ?? 0).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </div>

                <DialogFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleTransfer}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {loading ? "Processando..." : "Transferir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TransferDialog;
