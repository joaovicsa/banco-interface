'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet } from "lucide-react";

const Auth = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupFullName, setSignupFullName] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
            setErrorMessage(data.error || "Erro ao fazer login.");
        } else {
            localStorage.setItem("userId", data.id); 
            router.push("/Dashboard");
        }

        setLoading(false);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: signupEmail,
                password: signupPassword,
                name: signupFullName,
                balance: 0,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setErrorMessage(data.error || "Erro ao criar conta.");
        } else {
            localStorage.setItem("userId", data.id); // salva o ID gerado
            router.push("/Dashboard");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-strong">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-2">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Carteira Digital</CardTitle>
                    <CardDescription>Gerencie seu dinheiro com segurança</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Cadastro</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Senha</Label>
                                    <Input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Entrando..." : "Entrar"}
                                </Button>
                                {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <Label>Nome Completo</Label>
                                    <Input
                                        type="text"
                                        value={signupFullName}
                                        onChange={(e) => setSignupFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Senha</Label>
                                    <Input
                                        type="password"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Cadastrando..." : "Criar Conta"}
                                </Button>
                                {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default Auth;
