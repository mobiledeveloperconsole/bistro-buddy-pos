import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, CartItem } from "@/types/pos";

export const useOrders = (dateRange?: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ["orders", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (dateRange) {
        query = query
          .gte("created_at", dateRange.start.toISOString())
          .lte("created_at", dateRange.end.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Order[];
    },
  });
};

export const useOrderWithItems = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const [orderResult, itemsResult] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ]);
      
      if (orderResult.error) throw orderResult.error;
      if (itemsResult.error) throw itemsResult.error;
      
      return {
        order: orderResult.data as Order,
        items: itemsResult.data as OrderItem[],
      };
    },
    enabled: !!orderId,
  });
};

interface CreateOrderParams {
  cart: CartItem[];
  customerId?: string;
  discount?: number;
  pointsRedeemed?: number;
  paymentMethod?: string;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cart, customerId, discount = 0, pointsRedeemed = 0, paymentMethod = 'cash' }: CreateOrderParams) => {
      const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const tax = subtotal * 0.1; // 10% tax
      const pointsDiscount = pointsRedeemed * 0.01; // 1 point = $0.01
      const total = Math.max(0, subtotal + tax - discount - pointsDiscount);
      const pointsEarned = Math.floor(total); // 1 point per $1 spent
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId || null,
          subtotal,
          discount: discount + pointsDiscount,
          tax,
          total,
          payment_method: paymentMethod,
          points_earned: pointsEarned,
          points_redeemed: pointsRedeemed,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));
      
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      return order as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
