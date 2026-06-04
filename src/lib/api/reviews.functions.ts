import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "./supabase.server";

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
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase não configurado");

    const { error } = await supabase.from("reviews").insert({
      product_id: data.product_id,
      order_id: data.order_id,
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
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
});
