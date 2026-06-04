import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "./supabase.server";

export const listAllOrders = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseAdmin();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const orderIds = orders.map((o) => o.id);
  if (orderIds.length === 0) return [];

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (itemsError) throw new Error(itemsError.message);

  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }

  return orders.map((o) => ({
    ...o,
    items: itemsByOrder.get(o.id) ?? [],
  }));
});

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "preparing", "delivering", "delivered", "cancelled"]),
});

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator(updateStatusSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("orders")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.orderId);

    if (error) throw new Error(error.message);

    return { success: true };
  });

// ─── Product Management ────────────────────────────────────────────────

export const listAllProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at");

  if (error) throw new Error(error.message);
  return data;
});

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  price: z.number().positive("Preço deve ser positivo"),
  old_price: z.number().nullable().optional(),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  tag: z.string().nullable().optional(),
  image: z.string().min(1, "Imagem é obrigatória"),
  available: z.boolean(),
});

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator(productSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("products").insert({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      old_price: data.old_price ?? null,
      category_id: data.category_id,
      tag: data.tag ?? null,
      image: data.image,
      available: data.available,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });

const updateProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  old_price: z.number().nullable().optional(),
  category_id: z.string().min(1),
  tag: z.string().nullable().optional(),
  image: z.string().min(1),
  available: z.boolean(),
});

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator(updateProductSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("products")
      .update({
        name: data.name,
        description: data.description,
        price: data.price,
        old_price: data.old_price ?? null,
        category_id: data.category_id,
        tag: data.tag ?? null,
        image: data.image,
        available: data.available,
      })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const toggleProductAvailability = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), available: z.boolean() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("products")
      .update({ available: data.available })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

const uploadImageSchema = z.object({
  base64: z.string(),
  fileName: z.string(),
});

// ─── Coupon Management ─────────────────────────────────────────────────

export const listAllCoupons = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
});

const couponSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().positive("Valor deve ser positivo"),
  min_order_value: z.number().nullable().optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  expires_at: z.string().nullable().optional(),
});

export const createCoupon = createServerFn({ method: "POST" })
  .inputValidator(couponSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("coupons").insert({
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      min_order_value: data.min_order_value ?? null,
      max_uses: data.max_uses ?? null,
      expires_at: data.expires_at ?? null,
      active: true,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

const toggleCouponSchema = z.object({
  id: z.string().uuid(),
  active: z.boolean(),
});

export const toggleCoupon = createServerFn({ method: "POST" })
  .inputValidator(toggleCouponSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("coupons")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator(uploadImageSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    const base64Data = data.base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const ext = data.fileName.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(path, buffer, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: publicUrl } = supabase.storage
      .from("products")
      .getPublicUrl(path);

    return { url: publicUrl.publicUrl };
  });
