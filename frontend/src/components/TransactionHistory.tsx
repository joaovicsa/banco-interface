import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpRight, Undo2, User } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
}

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
                return <ArrowDownToLine className="w-4 h-4" />;
            case "transfer_sent":
            case "transfer_received":
                return <ArrowUpRight className="w-4 h-4" />;
            case "reversal":
                return <Undo2 className="w-4 h-4" />;
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
                return "text-success";
            case "transfer_sent":
                return "text-destructive";
            case "reversal":
                return "text-muted-foreground";
            default:
                return "";
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-medium">
            <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Nenhuma transação encontrada
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{getTransactionLabel(transaction.type)}</p>
                                            {transaction.reversed && (
                                                <Badge variant="secondary" className="text-xs">Revertida</Badge>
                                            )}
                                            {transaction.reversal_of && (
                                                <Badge variant="outline" className="text-xs">Reversão</Badge>
                                            )}
                                        </div>
                                        {transaction.description && (
                                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                                        )}
                                        {transaction.related_user_id && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                <User className="w-3 h-3" />
                                                <span>{relatedUsers[transaction.related_user_id] || "Usuário"}</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(transaction.created_at).toLocaleString("pt-BR")}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <div>
                                        <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                                            {transaction.type === "transfer_sent" ? "-" : transaction.type === "reversal" ? "" : "+"}
                                            R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Saldo: R$ {transaction.balance_after.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    {!transaction.reversed && !transaction.reversal_of && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Undo2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirmar reversão</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tem certeza que deseja reverter esta transação? Esta ação não pode ser desfeita.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleReverseTransaction(transaction.id, transaction.amount, transaction.type)}
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
