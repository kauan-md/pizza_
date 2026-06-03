import { Zap, Clock } from "lucide-react";

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById("cardapio")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="px-4 pt-20">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-primary/20 bg-card">
        {/* Background pizza image */}
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=70"
          alt="Pizza artesanal"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        {/* Yellow glow + dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />

        <div className="relative flex flex-col gap-5 p-6 sm:p-10 md:max-w-xl">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Clock className="h-3.5 w-3.5" /> Seg. a Qui.
          </span>

          <h1 className="font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl">
            No precinho de segunda a quinta{" "}
            <span className="text-primary">por apenas R$ 22,99</span>
          </h1>

          <p className="max-w-md text-sm text-muted-foreground sm:text-base">
            Massa de longa fermentação, ingredientes premium e entrega rápida em
            Osasco. Peça agora e pague no Pix.
          </p>

          <button
            onClick={scrollToMenu}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-display text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95 hover:brightness-105"
          >
            <Zap className="h-5 w-5 fill-primary-foreground" />
            Aproveitar Oferta
          </button>
        </div>
      </div>
    </section>
  );
}
