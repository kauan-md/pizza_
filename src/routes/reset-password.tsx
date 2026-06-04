import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Redefinir Senha — Pizza" }],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      toast.error("Erro de configuração. Verifique as variáveis de ambiente.");
      return;
    }
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Check if already have session from URL fragment
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.warning("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Senha redefinida com sucesso!");
      navigate({ to: "/" });
    } catch {
      toast.error("Erro ao redefinir a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex items-center gap-1 font-display text-xl font-extrabold uppercase text-primary">
        <span>PIZZA</span>
        <Zap className="h-5 w-5 fill-primary" />
      </div>

      <h1 className="mt-6 text-xl font-bold text-foreground">Redefinir Senha</h1>
      <p className="mt-1 text-sm text-muted-foreground">Escolha uma nova senha para sua conta.</p>

      <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nova Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="Mínimo 6 caracteres" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirmar Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="Repita a senha" className="pl-9" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} />
          </div>
        </div>

        <Button type="submit" className="w-full h-11 text-base font-bold" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Redefinir senha"}
        </Button>
      </form>
    </div>
  );
}
