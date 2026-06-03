import { useState } from "react";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Loader2, Zap } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  
  // Local loading states
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Login efetuado com o Google!", {
        description: "Bem-vindo de volta à Pizza Lopez!",
      });
      onClose();
    } catch (error) {
      toast.error("Erro ao fazer login com o Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Preencha todos os campos.");
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login efetuado com sucesso!", {
        description: `Bem-vindo de volta!`,
      });
      onClose();
    } catch (error) {
      toast.error("Erro ao efetuar o login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Conta criada com sucesso!", {
        description: `Bem-vindo, ${name}! Aproveite nosso cardápio.`,
      });
      onClose();
    } catch (error) {
      toast.error("Erro ao criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-md border-primary/10 bg-card/95 p-6 backdrop-blur-md sm:rounded-2xl">
      <DialogHeader className="items-center text-center">
        <div className="flex items-center gap-1 font-display text-xl font-extrabold uppercase text-primary">
          <span>PIZZA</span>
          <Zap className="h-5 w-5 fill-primary" />
          <span>LOPEZ</span>
        </div>
        <DialogTitle className="mt-2 text-xl font-bold text-foreground">
          {activeTab === "login" ? "Entre na sua conta" : "Crie sua conta grátis"}
        </DialogTitle>
        <DialogDescription>
          {activeTab === "login"
            ? "Acompanhe seus pedidos e compre com 1-clique"
            : "Faça seu cadastro para começar a pedir"}
        </DialogDescription>
      </DialogHeader>

      <Tabs
        defaultValue="login"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "login" | "signup")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="login" disabled={loading}>
            Entrar
          </TabsTrigger>
          <TabsTrigger value="signup" disabled={loading}>
            Cadastrar
          </TabsTrigger>
        </TabsList>

        {/* LOGIN TAB */}
        <TabsContent value="login" className="mt-4 space-y-4">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="exemplo@email.com"
                  className="pl-9 bg-background/50 focus:border-primary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Senha
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Funcionalidade de recuperação de senha simulada.");
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 bg-background/50 focus:border-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-bold transition-transform active:scale-[0.98] hover:brightness-105" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar na conta"
              )}
            </Button>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-x-0 h-px bg-border" />
            <span className="relative bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">
              Ou continue com
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-border bg-background/30 hover:bg-secondary font-medium transition-transform active:scale-[0.98]"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.13-.63-.19-1.3-.19-1.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Entrar com o Google
          </Button>
        </TabsContent>

        {/* SIGNUP TAB */}
        <TabsContent value="signup" className="mt-4 space-y-4">
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Seu nome"
                  className="pl-9 bg-background/50 focus:border-primary/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="exemplo@email.com"
                  className="pl-9 bg-background/50 focus:border-primary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="pl-9 bg-background/50 focus:border-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Repita sua senha"
                  className="pl-9 bg-background/50 focus:border-primary/50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-bold transition-transform active:scale-[0.98] hover:brightness-105" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Criar minha conta"
              )}
            </Button>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-x-0 h-px bg-border" />
            <span className="relative bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">
              Ou cadastre-se com
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-border bg-background/30 hover:bg-secondary font-medium transition-transform active:scale-[0.98]"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.13-.63-.19-1.3-.19-1.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Cadastrar com o Google
          </Button>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}
