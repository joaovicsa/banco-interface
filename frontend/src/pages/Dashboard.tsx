import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpRight, LogOut, RefreshCcw, Wallet } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import TransactionHistory from "@/components/TransactionHistory";
import DepositDialog from "@/components/DepositDialog";

import { useRouter } from "next/navigation";
import TransferDialog from "@/components/TransferDialog";


interface Profile {
    id: string;
    full_name: string;
    email: string;
    balance: number;
}

const Dashboard = () => {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [depositOpen, setDepositOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);

    useEffect(() => {
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push("/auth");
            } else {
                setUser(session.user);
                setTimeout(() => {
                    fetchProfile(session.user.id);
                }, 0);
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/auth");
            return;
        }

        setUser(session.user);
        await fetchProfile(session.user.id);
    };

    const fetchProfile = async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            toast(
                "Erro ao carregar perfil"
            )
        } else {
            setProfile(data);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    const handleRefresh = () => {
        if (user) {
            fetchProfile(user.id);
        }
    };

    if (loading || !profile) {
        return (
            <div className="min-h-screen gradient-subtle flex items-center justify-center">
                <div className="animate-pulse">Carregando...</div>
            </div>
        );
    }

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
                            <p className="text-sm text-muted-foreground">{profile.full_name}</p>
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
                                    R$ {profile.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    currentBalance={profile.balance}
                    onSuccess={handleRefresh}
                />

                <TransferDialog
                    open={transferOpen}
                    onOpenChange={setTransferOpen}
                    userId={user!.id}
                    currentBalance={profile.balance}
                    userEmail={profile.email}
                    onSuccess={handleRefresh}
                />
            </div>
        </div>
    );
};

export default Dashboard;
