import { useState } from "react";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Loader2, Zap, ArrowLeft } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
}

type View = "login" | "signup" | "forgot";

export function AuthModal({ onClose }: AuthModalProps) {
  const { login, loginWithGoogle, register, forgotPassword } = useAuth();

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login efetuado com sucesso!");
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
        description: `Bem-vindo, ${name}!`,
      });
      onClose();
    } catch (error) {
      toast.error("Erro ao criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.warning("Informe seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("E-mail enviado!", {
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      onClose();
    } catch (error) {
      toast.error("Erro ao enviar e-mail de recuperação.");
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
        </div>
        <DialogTitle className="mt-2 text-xl font-bold text-foreground">
          {view === "login" && "Entre na sua conta"}
          {view === "signup" && "Crie sua conta grátis"}
          {view === "forgot" && "Recuperar senha"}
        </DialogTitle>
        <DialogDescription>
          {view === "login" && "Acompanhe seus pedidos e compre com 1-clique"}
          {view === "signup" && "Faça seu cadastro para começar a pedir"}
          {view === "forgot" && "Receba um link para redefinir sua senha"}
        </DialogDescription>
      </DialogHeader>

      {view !== "forgot" && (
        <Tabs
          defaultValue="login"
          value={view}
          onValueChange={(v) => setView(v as View)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="login" disabled={loading}>Entrar</TabsTrigger>
            <TabsTrigger value="signup" disabled={loading}>Cadastrar</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* LOGIN */}
      {view === "login" && (
        <>
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="exemplo@email.com" className="pl-9 bg-background/50" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Senha</label>
              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-xs font-medium text-primary hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="••••••••" className="pl-9 bg-background/50" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-bold" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : "Entrar na conta"}
          </Button>
        </form>
        </>
      )}

      {/* SIGNUP */}
      {view === "signup" && (
        <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Seu nome" className="pl-9 bg-background/50" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="exemplo@email.com" className="pl-9 bg-background/50" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Mínimo 6 caracteres" className="pl-9 bg-background/50" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirmar Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Repita sua senha" className="pl-9 bg-background/50" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-bold" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cadastrando...</> : "Criar minha conta"}
          </Button>
        </form>
      )}

      {/* FORGOT PASSWORD */}
      {view === "forgot" && (
        <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="exemplo@email.com" className="pl-9 bg-background/50" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-bold" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : "Enviar link de recuperação"}
          </Button>

          <button
            type="button"
            onClick={() => setView("login")}
            className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar ao login
          </button>
        </form>
      )}
    </DialogContent>
  );
}
