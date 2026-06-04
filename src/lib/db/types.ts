export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  label: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  category_id: string;
  tag: string | null;
  image: string;
  available: boolean;
  created_at: string;
}

export type OrderStatus = "pending" | "preparing" | "delivering" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total: number;
  payment_method: string | null;
  payment_status: PaymentStatus | null;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  created_at: string;
}

export type DiscountType = "percentage" | "fixed";

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  order_id: string | null;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}
