
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.increment_coupon_used_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_coupon_used_count(uuid) to service_role;
