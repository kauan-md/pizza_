import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Zap, ArrowLeft, Clock, MapPin, Phone, Instagram } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [{ title: "Sobre — Pizza" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1 font-display text-lg font-extrabold uppercase text-primary">
          <span>PIZZA</span>
          <Zap className="h-4 w-4 fill-primary" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold text-foreground">
            Sobre a <span className="text-primary">Pizza</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A melhor pizza de Osasco no precinho
          </p>
        </div>

        {/* Story */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Nossa História</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Nascemos da paixão por pizza de verdade. Massa de longa fermentação, ingredientes
            selecionados e um forno que não para. Aqui em Osasco, cada pizza é feita com o
            cuidado que você merece — do preparo à entrega na sua porta.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            De segunda a quinta, oferecemos pizza no precinho sem perder a qualidade.
            Acreditamos que pizza boa não precisa ser cara.
          </p>
        </section>

        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <Clock className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display font-bold text-foreground">Horários</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Seg a Qui: 18h às 23h<br />
              Sex a Dom: 18h às 23h59
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <MapPin className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display font-bold text-foreground">Entrega</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Entregamos em toda Osasco.<br />
              Taxa de entrega: R$ 6,99
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <Phone className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display font-bold text-foreground">Contato</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              (11) 99999-9999<br />
              ola@pizza.com
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <Instagram className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display font-bold text-foreground">Redes</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              @pizzaosasco
            </p>
          </section>
        </div>

        {/* Commitment */}
        <section className="rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="font-display text-lg font-bold text-foreground">Feito com amor</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cada pizza sai do forno com o mesmo carinho que faríamos pra nossa família.
          </p>
          <div className="mt-4 flex justify-center gap-1 text-primary">
            <Zap className="h-5 w-5 fill-primary" />
            <Zap className="h-5 w-5 fill-primary" />
            <Zap className="h-5 w-5 fill-primary" />
          </div>
        </section>
      </div>
    </div>
  );
}
