import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpRight, Undo2, User } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Transaction {
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

        const channel = supabase
            .channel('transactions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    fetchTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            toast("Erro ao carregar transações");
        } else {
            setTransactions(data || []);

            const userIds = [...new Set(data?.map(t => t.related_user_id).filter(Boolean) as string[])];
            if (userIds.length > 0) {
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("id, full_name")
                    .in("id", userIds);

                if (profiles) {
                    const usersMap: Record<string, string> = {};
                    profiles.forEach(p => {
                        usersMap[p.id] = p.full_name;
                    });
                    setRelatedUsers(usersMap);
                }
            }
        }
        setLoading(false);
    };

    const handleReverseTransaction = async (transactionId: string, originalAmount: number, transactionType: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            toast("Erro");
            return;
        }

        let newBalance = profile.balance;

        if (transactionType === "deposit") {
            newBalance -= originalAmount;
        } else if (transactionType === "transfer_sent") {
            newBalance += originalAmount;
        } else if (transactionType === "transfer_received") {
            newBalance -= originalAmount;
        }

        const { error: updateError } = await supabase
            .from("profiles")
            .update({ balance: newBalance })
            .eq("id", user.id);

        if (updateError) {
            toast("Erro ao reverter transação");
            return;
        }

        const { error: reversalInsertError } = await supabase
            .from("transactions")
            .insert({
                user_id: user.id,
                type: "reversal",
                amount: originalAmount,
                balance_after: newBalance,
                description: `Reversão de transação`,
                reversal_of: transactionId,
            });

        if (reversalInsertError) {
            toast("Erro ao registrar reversão");
            return;
        }

        const { error: markReversedError } = await supabase
            .from("transactions")
            .update({ reversed: true })
            .eq("id", transactionId);

        if (markReversedError) {
            toast("Erro ao marcar transação como revertida");
            return;
        }

        toast("Transação revertida com sucesso!");

        onRefresh();
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
