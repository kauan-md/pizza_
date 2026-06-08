import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

export async function createReview({ data: input }: { data: z.infer<typeof createReviewSchema> }) {
  const data = createReviewSchema.parse(input);
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("user_id")
    .eq("id", data.order_id)
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!order || order.user_id !== user.id) {
    throw new Error("Unauthorized: review can only be created for your own order");
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: data.product_id,
    order_id: data.order_id,
    user_id: user.id,
    author_name: data.author_name,
    rating: data.rating,
    comment: data.comment || null,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

const createReviewSchema = z.object({
  product_id: z.string(),
  order_id: z.string().uuid(),
  author_name: z.string().min(1, "Nome é obrigatório"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function listProductReviews({ data: input }: { data: { product_id: string } }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", input.product_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return reviews;
}

export async function listAllReviews() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
