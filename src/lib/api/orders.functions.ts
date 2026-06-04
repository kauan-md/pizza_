import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseServer } from "./supabase.server";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string(),
      product_name: z.string(),
      unit_price: z.number(),
      quantity: z.number(),
    })
  ),
  total: z.number(),
  delivery_address: z.string().min(1, "Endereço de entrega é obrigatório"),
  notes: z.string().optional(),
  payment_method: z.enum(["pix", "money", "card"]),
  user_id: z.string().uuid().optional(),
  coupon_id: z.string().uuid().optional(),
  discount_applied: z.number().optional(),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator(createOrderSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServer();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        total: data.total,
        payment_method: data.payment_method,
        payment_status: "pending",
        delivery_address: data.delivery_address,
        notes: data.notes || null,
        status: "pending",
        user_id: data.user_id || null,
        coupon_id: data.coupon_id || null,
        discount_applied: data.discount_applied || 0,
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw new Error(itemsError.message);

    if (data.coupon_id) {
      const { error: couponError } = await supabase.rpc("increment_coupon_used_count", {
        p_coupon_id: data.coupon_id,
      });
      if (couponError) {
        await supabase.from("orders").update({ coupon_id: null, discount_applied: 0 }).eq("id", order.id);
        throw new Error("Erro ao aplicar cupom.");
      }
    }

    return order as { id: string };
  });

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServer();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .single();

    if (orderError) throw new Error(orderError.message);

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", data.id);

    if (itemsError) throw new Error(itemsError.message);

    return { order, items };
  });
