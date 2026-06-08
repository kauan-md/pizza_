import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "@/routes/index";
import Sobre from "@/routes/sobre";
import Admin from "@/routes/admin";
import Checkout from "@/routes/checkout";
import Perfil from "@/routes/perfil";
import Pedido from "@/routes/pedido.$id";
import ResetPassword from "@/routes/reset-password";
import NotFound from "@/routes/not-found";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/pedido/:id" element={<Pedido />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
