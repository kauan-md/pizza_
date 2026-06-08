import { useState, useEffect } from "react";
import { Zap, User, ShoppingBag, LogOut, Package, Shield, Sun, Moon } from "lucide-react";
import { useCart } from "@/context/cart";
import { useAuth } from "@/context/auth";
import { formatBRL } from "@/data/menu";
import { Link } from "react-router-dom";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AuthModal } from "./AuthModal";
import { getNewOrderCount } from "@/lib/notification";
import { useTheme } from "@/context/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { total, itemCount } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [authOpen, setAuthOpen] = useState(false);
  const [newOrders, setNewOrders] = useState(getNewOrderCount());

  useEffect(() => {
    function handle() { setNewOrders(getNewOrderCount()); }
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-3 items-center px-4">
        {/* Logo */}
        <div className="flex items-center font-display text-lg font-extrabold uppercase tracking-tight text-primary sm:text-xl">
          <span>PIZZA</span>
          <Zap className="mx-0.5 h-5 w-5 fill-primary text-primary" />
        </div>

        {/* Status + Sobre (hidden on very small screens) */}
        <div className="hidden items-center justify-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Aberto · Entregando em Osasco
          </div>
          <Link
            to="/sobre"
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Sobre
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Menu do usuário"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary border border-primary/20 font-display font-bold text-sm transition-transform active:scale-95 hover:bg-primary/15"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-primary/10 bg-card/95 backdrop-blur-md animate-in fade-in-80 duration-100">
                <DropdownMenuLabel className="flex items-center gap-3 font-semibold text-foreground">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-bold text-sm">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold">{user.name}</div>
                    <div className="text-[11px] font-normal text-muted-foreground truncate">{user.email}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/perfil" className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Meus Pedidos</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/admin" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                    {newOrders > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                        {newOrders}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair da conta</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={authOpen} onOpenChange={setAuthOpen}>
              <DialogTrigger asChild>
                <button
                  aria-label="Perfil"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-95 hover:bg-secondary/70"
                >
                  <User className="h-5 w-5" />
                </button>
              </DialogTrigger>
              <AuthModal onClose={() => setAuthOpen(false)} />
            </Dialog>
          )}

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-95 hover:bg-secondary/70"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            onClick={onCartClick}
            aria-label="Carrinho"
            className="relative flex items-center gap-2 rounded-full bg-primary px-3 py-2 font-semibold text-primary-foreground transition-transform active:scale-95 hover:brightness-105 sm:px-4"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm tabular-nums">{formatBRL(total)}</span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
