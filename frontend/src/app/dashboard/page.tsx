/* eslint-disable react-hooks/exhaustive-deps */
/**
 * @file page/dashboard.tsx
 * @description Página principal do usuário autenticado na aplicação Banco Interface.
 * Exibe o saldo atual, histórico de transações, e permite realizar depósitos e transferências.
 * Utiliza componentes reutilizáveis e integra com a API para buscar dados do usuário.
 */


"use client";

import DepositDialog from "@/components/DepositDialog";
import TransactionHistory from "@/components/TransactionHistory";
import TransferDialog from "@/components/TransferDialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowDownToLine,
    ArrowUpRight,
    LogOut,
    RefreshCcw,
    Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { JSX, useEffect, useState } from "react";
import { TransactionSchema } from "@/types";
import DashboardSkeleton from "@/components/DashboardSkeleton";

/**
 * @type {Object} User
 * @property {string} id - Identificador único do usuário.
 * @property {string} name - Nome do usuário.
 * @property {string} email - E-mail do usuário.
 * @property {number} balance - Saldo atual do usuário.
 * @property {Array<Transaction>} transactions - Lista de transações do usuário.
 */

type User = {
    id: string;
    name: string;
    email: string;
    balance: number;
    transactions: z.infer<typeof TransactionSchema>[];
};


/**
 * @component Dashboard
 * @description Componente principal da carteira digital.
 * Exibe informações do usuário, saldo, histórico de transações e botões para ações financeiras.
 *
 * @returns {JSX.Element} Interface da carteira digital.
 */

export default function Dashboard(): JSX.Element {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<
        z.infer<typeof TransactionSchema>[]
    >([]);
    const [depositOpen, setDepositOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Recupera o ID do usuário armazenado localmente ao carregar a página.
    useEffect(() => {
        setIsMounted(true);
        const storedId = localStorage.getItem("userId");
        if (storedId) setUserId(storedId);
    }, []);

    //  Busca os dados do usuário quando o ID estiver disponível.
    useEffect(() => {
        if (userId) fetchUser();
    }, [userId]);

    /**
         * @function fetchUser
         * @description Consulta a API para obter os dados do usuário e valida as transações.
         */

    const fetchUser = async () => {
        const res = await fetch(`/api/user/${userId}`);
        const data = await res.json();
        setUser(data);

        const validatedTransactions = z
            .array(TransactionSchema)
            .safeParse(data.transactions);
        setTransactions(validatedTransactions.success ? validatedTransactions.data : []);
    };


    /**
         * @function handleRefresh
         * @description Atualiza os dados do usuário.
         */
    const handleRefresh = async () => await fetchUser();

    /**
         * @function handleLogout
         * @description Realiza logout do usuário e redireciona para a página inicial.
         */
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
        } catch (err) {
            console.error("Falha ao deslogar", err);
        }
    };

    if (!isMounted || !userId || !user) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-[#f6f8fb] text-gray-900">
            <div className="container mx-auto p-4 md:p-8 max-w-5xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                                background:
                                    "linear-gradient(135deg, #12B886 0%, #0CA678 100%)",
                            }}
                        >
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Carteira Digital</h1>
                            <p className="text-sm text-gray-500">{user.name}</p>
                        </div>
                    </div>
                    <Button name='LogOut' variant="ghost" onClick={handleLogout} size="icon">
                        Log Out
                        <LogOut className="w-5 h-5 text-gray-600" />
                    </Button>
                </div>

                {/* Card de saldo */}
                <Card className="mb-8 border-none shadow-md rounded-2xl bg-white">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardDescription className="text-gray-600 font-medium">
                                    Saldo Disponível
                                </CardDescription>
                                <CardTitle className="text-4xl font-bold text-gray-900 mt-2">
                                    R${" "}
                                    {user.balance.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-600 hover:text-gray-800"
                                onClick={handleRefresh}
                            >
                                Atualizar
                                <RefreshCcw className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            <Button
                                onClick={() => setDepositOpen(true)}
                                className="w-full text-white font-medium rounded-xl border-0 py-5 text-base"
                                style={{
                                    background: "linear-gradient(135deg, #12B886 0%, #0CA678 100%)",
                                }}
                            >
                                <ArrowDownToLine className="w-4 h-4 mr-2" />
                                Depositar
                            </Button>
                            <Button
                                onClick={() => setTransferOpen(true)}
                                className="w-full text-white font-medium rounded-xl border-0 py-5 text-base"
                                style={{
                                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                                }}
                            >
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                Transferir
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Histórico de Transações */}
                <div className="mt-8">
                    <TransactionHistory userId={user.id} onRefresh={handleRefresh} />
                </div>

                {/* Modais */}
                <DepositDialog
                    open={depositOpen}
                    onOpenChange={setDepositOpen}
                    userId={user.id}
                    currentBalance={user.balance}
                    onSuccess={handleRefresh}
                />
                <TransferDialog
                    open={transferOpen}
                    onOpenChange={setTransferOpen}
                    userId={user.id}
                    currentBalance={user.balance}
                    userEmail={user.email}
                    onSuccess={handleRefresh}
                />
            </div>
        </div>
    );
}
