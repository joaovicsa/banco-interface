
import { Button } from "@/components/ui/button";
import { Wallet, Shield, TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Index = () => {
    const router = useRouter()

    return (
        <div className="min-h-screen gradient-subtle">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16 animate-slide-up">
                    <div className="mx-auto w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-medium">
                        <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Carteira Digital
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Gerencie seu dinheiro com segurança, realize transferências e depósitos de forma simples e rápida.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => router.push("/auth")} size="lg" className="gradient-primary border-0 shadow-medium">
                            Começar Agora
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="text-center p-6 rounded-2xl bg-card shadow-soft hover:shadow-medium transition-shadow">
                        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Seguro e Confiável</h3>
                        <p className="text-muted-foreground">
                            Suas transações protegidas com a melhor tecnologia de segurança.
                        </p>
                    </div>

                    <div className="text-center p-6 rounded-2xl bg-card shadow-soft hover:shadow-medium transition-shadow">
                        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Transferências Rápidas</h3>
                        <p className="text-muted-foreground">
                            Envie dinheiro para qualquer usuário em segundos.
                        </p>
                    </div>

                    <div className="text-center p-6 rounded-2xl bg-card shadow-soft hover:shadow-medium transition-shadow">
                        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Controle Total</h3>
                        <p className="text-muted-foreground">
                            Acompanhe todo o histórico e reverta operações quando necessário.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
