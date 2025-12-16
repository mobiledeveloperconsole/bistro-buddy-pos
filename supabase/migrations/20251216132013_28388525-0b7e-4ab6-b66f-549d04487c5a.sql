-- Fix function search_path security warnings
CREATE OR REPLACE FUNCTION public.update_stock_after_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products 
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_customer_loyalty()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers 
    SET loyalty_points = loyalty_points + NEW.points_earned - NEW.points_redeemed,
        total_spent = total_spent + NEW.total
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$;