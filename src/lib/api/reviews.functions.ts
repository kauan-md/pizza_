import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getSupabaseAdmin } from "./supabase.server";

async function requireAuthenticatedUser() {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: missing or invalid authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user?.id) {
    throw new Error("Unauthorized: invalid user token");
  }

  return userData.user.id;
}

async function requireAdmin() {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: missing or invalid authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user?.id) {
    throw new Error("Unauthorized: invalid user token");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }

  return userData.user.id;
}

export const createReview = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      product_id: z.string(),
      order_id: z.string().uuid(),
      author_name: z.string().min(1, "Nome é obrigatório"),
      rating: z.number().int().min(1).max(5),
      comment: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUser();
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase não configurado");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", data.order_id)
      .single();

    if (orderError) throw new Error(orderError.message);
    if (!order || order.user_id !== userId) {
      throw new Error("Unauthorized: review can only be created for your own order");
    }

    const { error } = await supabase.from("reviews").insert({
      product_id: data.product_id,
      order_id: data.order_id,
      user_id: userId,
      author_name: data.author_name,
      rating: data.rating,
      comment: data.comment || null,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const listProductReviews = createServerFn({ method: "GET" })
  .inputValidator(z.object({ product_id: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase não configurado");

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", data.product_id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return reviews;
  });

export const listAllReviews = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
});
