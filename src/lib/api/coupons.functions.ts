import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

const validateCouponSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  orderTotal: z.number().positive(),
});

export async function validateCoupon({ data: input }: { data: z.infer<typeof validateCouponSchema> }) {
  const data = validateCouponSchema.parse(input);
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", data.code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!coupon) throw new Error("Cupom não encontrado.");
  if (!coupon.active) throw new Error("Este cupom não está mais ativo.");
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw new Error("Este cupom expirou.");
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    throw new Error("Este cupom já atingiu o limite de usos.");
  }
  if (coupon.min_order_value !== null && data.orderTotal < coupon.min_order_value) {
    throw new Error(`Valor mínimo do pedido: ${formatBRL(coupon.min_order_value)}.`);
  }

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = Math.round(data.orderTotal * (coupon.discount_value / 100) * 100) / 100;
    if (discount > data.orderTotal) discount = data.orderTotal;
  } else {
    discount = Math.min(coupon.discount_value, data.orderTotal);
  }

  return {
    coupon_id: coupon.id,
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    discount,
  };
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
