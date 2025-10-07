import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface DepositDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    currentBalance: number;
    onSuccess: () => void;
}

const DepositDialog = ({ open, onOpenChange, userId, currentBalance, onSuccess }: DepositDialogProps) => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDeposit = async () => {
        const depositAmount = parseFloat(amount);

        if (isNaN(depositAmount) || depositAmount <= 0) {
            toast("Valor inválido \n Por favor, insira um valor válido para depositar.")
            return;
        }

        setLoading(true);

        let adjustedBalance = currentBalance;
        if (currentBalance < 0) {
            adjustedBalance = depositAmount + currentBalance;
        } else {
            adjustedBalance = currentBalance + depositAmount;
        }

        const { error: updateError } = await supabase
            .from("profiles")
            .update({ balance: adjustedBalance })
            .eq("id", userId);

        if (updateError) {
            toast("Erro ao realizar depósito",);
            setLoading(false);
            return;
        }

        const { error: transactionError } = await supabase
            .from("transactions")
            .insert({
                user_id: userId,
                type: "deposit",
                amount: depositAmount,
                balance_after: adjustedBalance,
                description: "Depósito realizado",
            });

        if (transactionError) {
            toast("Erro ao registrar transação",);
        } else {
            toast(`Depósito realizado com sucesso!\nR$ ${depositAmount.toFixed(2)} foi adicionado à sua conta.`);
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
                    <DialogTitle>Realizar Depósito</DialogTitle>
                    <DialogDescription>
                        Adicione saldo à sua carteira digital.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="deposit-amount">Valor do Depósito</Label>
                        <Input
                            id="deposit-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDeposit} disabled={loading}>
                        {loading ? "Processando..." : "Depositar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DepositDialog;
