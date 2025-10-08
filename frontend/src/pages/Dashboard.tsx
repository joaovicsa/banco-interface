"use client";

import DepositDialog from "@/components/DepositDialog";
import TransactionHistory from "@/components/TransactionHistory";
import TransferDialog from "@/components/TransferDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTypeEnum, TransactionSchema } from "@/types";
import { ArrowDownToLine, ArrowUpRight, LogOut, RefreshCcw, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useEffect, useState } from "react";

type User = {
    id: string;
    name: string;
    email: string;
    balance: number;
    transactions: z.infer<typeof TransactionSchema>[];
};

export default function Dashboard() {
    const router = useRouter();
    const userId = "1"; // temporary placeholder — replace with real user session ID later

    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<z.infer<typeof TransactionSchema>[]>([]);
    const [depositOpen, setDepositOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);

    const fetchUser = async () => {
        const res = await fetch(`/api/user/${userId}`);
        const data = await res.json();
        setUser(data);

        const validatedTransactions = z.array(TransactionSchema).safeParse(data.transactions);
        setTransactions(validatedTransactions.success ? validatedTransactions.data : []);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleRefresh = () => {
        fetchUser();
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
        } catch (err) {
            console.error("Falha ao deslogar", err);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500 text-lg font-semibold">Usuário não encontrado</p>
            </div>
        );
    }

    const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="min-h-screen gradient-subtle">
            <div className="container mx-auto p-4 md:p-8 max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Carteira Digital</h1>
                            <p className="text-sm text-muted-foreground">{user.name}</p>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={handleLogout} size="icon">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>

                <Card className="mb-8 shadow-medium">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardDescription>Saldo Disponível</CardDescription>
                                <CardTitle className="text-4xl font-bold mt-2">
                                    R$ {user.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleRefresh}>
                                <RefreshCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={() => setDepositOpen(true)} className="gradient-primary border-0">
                                <ArrowDownToLine className="w-4 h-4 mr-2" />
                                Depositar
                            </Button>
                            <Button onClick={() => setTransferOpen(true)} variant="secondary">
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                Transferir
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <TransactionHistory userId={user!.id} onRefresh={handleRefresh} />

                <DepositDialog
                    open={depositOpen}
                    onOpenChange={setDepositOpen}
                    userId={user!.id}
                    currentBalance={user.balance}
                    onSuccess={handleRefresh}
                />

                <TransferDialog
                    open={transferOpen}
                    onOpenChange={setTransferOpen}
                    userId={user!.id}
                    currentBalance={user.balance}
                    userEmail={user.email}
                    onSuccess={handleRefresh}
                />
            </div>
        </div>
    );
};


