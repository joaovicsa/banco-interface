import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpRight, Undo2, User } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Transaction = {
    id: string;
    type: string;
    amount: number;
    balance_after: number;
    description: string | null;
    reversed: boolean;
    reversal_of: string | null;
    created_at: string;
    related_user_id: string | null;
};

interface TransactionHistoryProps {
    userId: string;
    onRefresh: () => void;
}

const TransactionHistory = ({ userId, onRefresh }: TransactionHistoryProps) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [relatedUsers, setRelatedUsers] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchTransactions();
    }, [userId]);

    const fetchTransactions = async () => {
        setLoading(true);
        const res = await fetch(`/api/transactions/${userId}`);
        const data = await res.json();

        if (!res.ok) {
            toast("Erro ao carregar transações");
        } else {
            setTransactions(data.transactions || []);
            setRelatedUsers(data.relatedUsers || {});
        }

        setLoading(false);
    };

    const handleReverseTransaction = async (
        transactionId: string,
        originalAmount: number,
        transactionType: string
    ) => {
        try {
            const res = await fetch("/api/transactions/reverse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    transactionId,
                    originalAmount,
                    transactionType,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast(data.error || "Erro ao reverter transação");
                return;
            }

            toast("Transação revertida com sucesso!");
            onRefresh();
        } catch (error) {
            console.error("Erro ao reverter transação:", error);
            toast("Erro inesperado ao reverter transação");
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "deposit":
                return <ArrowDownToLine className="w-5 h-5 text-primary" />;
            case "transfer_sent":
                return <ArrowUpRight className="w-5 h-5 text-destructive" />;
            case "transfer_received":
                return <ArrowDownToLine className="w-5 h-5 text-green-600" />;
            case "reversal":
                return <Undo2 className="w-5 h-5 text-muted-foreground" />;
            default:
                return null;
        }
    };

    const getTransactionLabel = (type: string) => {
        switch (type) {
            case "deposit":
                return "Depósito";
            case "transfer_sent":
                return "Transferência Enviada";
            case "transfer_received":
                return "Transferência Recebida";
            case "reversal":
                return "Reversão";
            default:
                return type;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case "deposit":
            case "transfer_received":
                return "text-green-600";
            case "transfer_sent":
                return "text-red-600";
            case "reversal":
                return "text-muted-foreground";
            default:
                return "";
        }
    };

    if (loading) {
        return (
            <Card className="mb-8 border-none shadow-md rounded-2xl bg-white">
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Carregando...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-8 border-none shadow-md rounded-2xl bg-white">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                    Histórico de Transações
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 h-96 pb-4 overflow-y-auto">
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Nenhuma transação encontrada
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Left Section */}
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm sm:text-base">
                                                {getTransactionLabel(transaction.type)}
                                            </p>
                                            {transaction.reversed && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs rounded-full"
                                                >
                                                    Revertida
                                                </Badge>
                                            )}
                                            {transaction.reversal_of && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs rounded-full"
                                                >
                                                    Reversão
                                                </Badge>
                                            )}
                                        </div>

                                        {transaction.description && (
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {transaction.description}
                                            </p>
                                        )}

                                        {transaction.related_user_id && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                <User className="w-3 h-3" />
                                                <span>
                                                    {relatedUsers[transaction.related_user_id] || "Usuário"}
                                                </span>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(transaction.created_at).toLocaleString("pt-BR", {
                                                dateStyle: "short",
                                                timeStyle: "medium",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className="text-right flex items-center gap-2">
                                    <div>
                                        <p
                                            className={`font-semibold text-sm sm:text-base ${getTransactionColor(
                                                transaction.type
                                            )}`}
                                        >
                                            {transaction.type === "transfer_sent"
                                                ? "-"
                                                : transaction.type === "reversal"
                                                    ? ""
                                                    : "+"}
                                            R${" "}
                                            {transaction.amount.toLocaleString("pt-BR", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Saldo: R${" "}
                                            {transaction.balance_after.toLocaleString("pt-BR", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>
                                    </div>

                                    {!transaction.reversed && !transaction.reversal_of && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-500 hover:text-destructive"
                                                >
                                                    <Undo2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl shadow-lg border border-gray-100 bg-white">
                                                <AlertDialogHeader className="space-y-2">
                                                    <AlertDialogTitle className="text-xl font-semibold text-gray-900">Confirmar reversão</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-gray-500">
                                                        Tem certeza que deseja reverter esta transação? Esta
                                                        ação não pode ser desfeita.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="flex justify-end gap-3 pt-2">
                                                    <AlertDialogCancel className="rounded-lg px-5 h-10 font-medium text-gray-700 border-gray-300 hover:bg-gray-100">Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="rounded-lg px-6 h-10 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                                                        onClick={() =>
                                                            handleReverseTransaction(
                                                                transaction.id,
                                                                transaction.amount,
                                                                transaction.type
                                                            )
                                                        }
                                                    >
                                                        Reverter
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TransactionHistory;
