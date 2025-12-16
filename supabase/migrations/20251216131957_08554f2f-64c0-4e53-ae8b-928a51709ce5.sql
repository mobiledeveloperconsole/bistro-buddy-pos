-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products/menu items table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table for loyalty
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (for POS terminal use)
CREATE POLICY "Public access for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- Function to update stock after order
CREATE OR REPLACE FUNCTION public.update_stock_after_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products 
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stock
CREATE TRIGGER on_order_item_created
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_after_order();

-- Function to update customer loyalty
CREATE OR REPLACE FUNCTION public.update_customer_loyalty()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers 
    SET loyalty_points = loyalty_points + NEW.points_earned - NEW.points_redeemed,
        total_spent = total_spent + NEW.total
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for loyalty updates
CREATE TRIGGER on_order_created_loyalty
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_loyalty();

-- Insert sample categories
INSERT INTO public.categories (name, icon) VALUES
  ('Burgers', '🍔'),
  ('Pizza', '🍕'),
  ('Drinks', '🥤'),
  ('Sides', '🍟'),
  ('Desserts', '🍰');

-- Insert sample products
INSERT INTO public.products (category_id, name, price, stock_quantity) VALUES
  ((SELECT id FROM categories WHERE name = 'Burgers'), 'Classic Burger', 8.99, 50),
  ((SELECT id FROM categories WHERE name = 'Burgers'), 'Cheese Burger', 9.99, 45),
  ((SELECT id FROM categories WHERE name = 'Burgers'), 'Double Burger', 12.99, 30),
  ((SELECT id FROM categories WHERE name = 'Pizza'), 'Margherita', 14.99, 25),
  ((SELECT id FROM categories WHERE name = 'Pizza'), 'Pepperoni', 16.99, 20),
  ((SELECT id FROM categories WHERE name = 'Pizza'), 'BBQ Chicken', 17.99, 15),
  ((SELECT id FROM categories WHERE name = 'Drinks'), 'Cola', 2.99, 100),
  ((SELECT id FROM categories WHERE name = 'Drinks'), 'Lemonade', 3.49, 80),
  ((SELECT id FROM categories WHERE name = 'Drinks'), 'Iced Tea', 2.99, 70),
  ((SELECT id FROM categories WHERE name = 'Sides'), 'French Fries', 4.99, 60),
  ((SELECT id FROM categories WHERE name = 'Sides'), 'Onion Rings', 5.49, 40),
  ((SELECT id FROM categories WHERE name = 'Desserts'), 'Brownie', 4.99, 35),
  ((SELECT id FROM categories WHERE name = 'Desserts'), 'Ice Cream', 3.99, 50);