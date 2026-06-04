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
  const { login, register, forgotPassword } = useAuth();

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
        <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
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
