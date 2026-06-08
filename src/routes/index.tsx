import { useState } from "react";
import { Zap } from "lucide-react";
import { Header } from "@/components/pizza/Header";
import { Hero } from "@/components/pizza/Hero";
import { Menu } from "@/components/pizza/Menu";
import { CartBar } from "@/components/pizza/CartBar";
import { CartSheet } from "@/components/pizza/CartSheet";

export default function Index() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-28">
        <Header onCartClick={() => setCartOpen(true)} />

        <main>
          <Hero />
          <Menu />
        </main>

        <footer className="mx-auto mt-12 w-full max-w-6xl px-4 pb-8 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1 font-display text-sm font-extrabold uppercase text-primary">
            PIZZA <Zap className="h-4 w-4 fill-primary" />
          </div>
          <p className="mt-2">Entregando sabor em Osasco · Pague no Pix</p>
          <p className="mt-1">© {new Date().getFullYear()} Pizza. Todos os direitos reservados.</p>
        </footer>

        <CartBar onCheckout={() => setCartOpen(true)} />
        <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      </div>
  );
}
