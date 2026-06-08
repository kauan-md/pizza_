import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

export async function listAllOrders() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return orders;
}

export async function updateOrderStatus({ data: input }: { data: { orderId: string; status: string } }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { error } = await supabase
    .from("orders")
    .update({ status: input.status })
    .eq("id", input.orderId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function listAllProducts() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return products;
}

export async function createProduct({ data: input }: { data: any }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { error } = await supabase.from("products").insert(input);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateProduct({ data: input }: { data: any }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { id, ...fields } = input;
  const { error } = await supabase.from("products").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function toggleProductAvailability({ data: input }: { data: { id: string; available: boolean } }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { error } = await supabase
    .from("products")
    .update({ available: input.available })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function uploadImage({ data: input }: { data: { base64: string; fileName: string } }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: uploadData, error } = await supabase.storage
    .from("products")
    .upload(`${Date.now()}-${input.fileName}`, decodeBase64(input.base64), {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data: publicUrl } = supabase.storage
    .from("products")
    .getPublicUrl(uploadData.path);

  return { url: publicUrl.publicUrl };
}

export async function listAllCoupons() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: coupons, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return coupons;
}

export async function createCoupon({ data: input }: { data: any }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { error } = await supabase.from("coupons").insert(input);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function toggleCoupon({ data: input }: { data: { id: string; active: boolean } }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { error } = await supabase
    .from("coupons")
    .update({ active: input.active })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function checkAdminAccess() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);
  if (profile?.role !== "admin") throw new Error("Acesso negado");
}

function decodeBase64(base64: string): Uint8Array {
  const binStr = atob(base64.split(",")[1] || base64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes;
}
