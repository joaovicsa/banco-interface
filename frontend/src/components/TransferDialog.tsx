import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface TransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    currentBalance: number;
    userEmail: string;
    onSuccess: () => void;
}

const TransferDialog = ({ open, onOpenChange, userId, currentBalance, userEmail, onSuccess }: TransferDialogProps) => {
    const [recipientEmail, setRecipientEmail] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTransfer = async () => {
        const transferAmount = parseFloat(amount);

        if (isNaN(transferAmount) || transferAmount <= 0) {
            toast("Valor inválido \nPor favor, insira um valor válido para transferir.");
            return;
        }

        if (currentBalance < transferAmount) {
            toast("Saldo insuficiente \nVocê não possui saldo suficiente para realizar esta transferência.");
            return;
        }

        if (recipientEmail === userEmail) {
            toast("Email inválido \nVocê não pode transferir para si mesmo.");
            return;
        }

        setLoading(true);

        const { data: recipient, error: recipientError } = await supabase
            .from("profiles")
            .select("id, balance")
            .eq("email", recipientEmail)
            .single();

        if (recipientError || !recipient) {
            toast("Destinatário não encontrado \nNão foi possível encontrar um usuário com este email.");
            setLoading(false);
            return;
        }

        const newSenderBalance = currentBalance - transferAmount;
        const newRecipientBalance = recipient.balance + transferAmount;

        const { error: senderUpdateError } = await supabase
            .from("profiles")
            .update({ balance: newSenderBalance })
            .eq("id", userId);

        if (senderUpdateError) {
            toast("Erro ao realizar transferência");
            setLoading(false);
            return;
        }

        const { error: recipientUpdateError } = await supabase
            .from("profiles")
            .update({ balance: newRecipientBalance })
            .eq("id", recipient.id);

        if (recipientUpdateError) {
            await supabase
                .from("profiles")
                .update({ balance: currentBalance })
                .eq("id", userId);

            toast("Erro ao realizar transferência");
            setLoading(false);
            return;
        }

        const { error: senderTransactionError } = await supabase
            .from("transactions")
            .insert({
                user_id: userId,
                type: "transfer_sent",
                amount: transferAmount,
                balance_after: newSenderBalance,
                related_user_id: recipient.id,
                description: `Transferência para ${recipientEmail}`,
            });

        const { error: recipientTransactionError } = await supabase
            .from("transactions")
            .insert({
                user_id: recipient.id,
                type: "transfer_received",
                amount: transferAmount,
                balance_after: newRecipientBalance,
                related_user_id: userId,
                description: `Transferência recebida de ${userEmail}`,
            });

        if (senderTransactionError || recipientTransactionError) {
            toast("Erro ao registrar transação \nA transferência foi realizada, mas houve um erro ao registrar.",);
        } else {
            toast(`Transferência realizada com sucesso! \nR$ ${transferAmount.toFixed(2)} foi transferido para ${recipientEmail}.`);
            setRecipientEmail("");
            setAmount("");
            onOpenChange(false);
            onSuccess();
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Realizar Transferência</DialogTitle>
                    <DialogDescription>
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
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Saldo disponível: R$ {currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleTransfer} disabled={loading}>
                        {loading ? "Processando..." : "Transferir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TransferDialog;
