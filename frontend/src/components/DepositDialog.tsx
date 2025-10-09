import { useState } from "react";
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

type DepositDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    currentBalance: number;
    onSuccess: () => void;
};

const DepositDialog = ({
    open,
    onOpenChange,
    userId,
    currentBalance,
    onSuccess,
}: DepositDialogProps) => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDeposit = async () => {
        const depositAmount = parseFloat(amount);

        if (isNaN(depositAmount) || depositAmount <= 0) {
            toast("Valor inválido.\nPor favor, insira um valor válido para depositar.");
            return;
        }

        setLoading(true);

        const res = await fetch("/api/deposit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, amount: depositAmount }),
        });

        const data = await res.json();

        if (depositAmount > currentBalance) {
            toast("O valor do depósito não pode ser maior que o saldo atual.");
            setLoading(false);
            return;
        }

        if (!res.ok) {
            toast(data.error || "Erro ao realizar depósito");
        } else {
            toast(
                `Depósito realizado com sucesso!\nR$ ${depositAmount.toFixed(
                    2
                )} foi adicionado à sua conta.`
            );
            setAmount("");
            onOpenChange(false);
            onSuccess();
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl shadow-lg border border-gray-100 bg-white">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Realizar Depósito
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Adicione saldo à sua carteira digital.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="deposit-amount"
                            className="text-sm font-medium text-gray-800"
                        >
                            Valor do Depósito
                        </Label>
                        <Input
                            id="deposit-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="border-2 border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-lg h-12 px-4"
                        />
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg px-5 h-10 font-medium text-gray-700 border-gray-300 hover:bg-gray-100"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeposit}
                        disabled={loading}
                        className="rounded-lg px-6 h-10 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                    >
                        {loading ? "Processando..." : "Depositar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DepositDialog;
