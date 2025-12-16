import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useCreateOrder } from "@/hooks/useOrders";
import { CategoryTabs } from "./CategoryTabs";
import { ProductGrid } from "./ProductGrid";
import { Cart } from "./Cart";
import { CheckoutDialog } from "./CheckoutDialog";
import { CustomerDialog } from "./CustomerDialog";
import { CartItem, Product, Customer } from "@/types/pos";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const POSTerminal = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: products = [], isLoading: productsLoading } = useProducts(selectedCategory || undefined);
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast({
            title: "Stock limit reached",
            description: `Only ${product.stock_quantity} available`,
            variant: "destructive",
          });
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    const item = cart.find((i) => i.product.id === productId);
    if (item && quantity > item.product.stock_quantity) {
      toast({
        title: "Stock limit reached",
        description: `Only ${item.product.stock_quantity} available`,
        variant: "destructive",
      });
      return;
    }
    
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const handleCheckout = async (params: {
    discount: number;
    pointsRedeemed: number;
    paymentMethod: string;
  }) => {
    const order = await createOrder.mutateAsync({
      cart,
      customerId: selectedCustomer?.id,
      ...params,
    });
    
    setCart([]);
    setSelectedCustomer(null);
    
    return order;
  };

  const isLoading = categoriesLoading || productsLoading;

  return (
    <div className="flex h-full gap-4">
      {/* Left side - Menu */}
      <div className="flex-1 flex flex-col min-w-0">
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>No products found</p>
            </div>
          ) : (
            <ProductGrid products={products} onAddToCart={addToCart} />
          )}
        </div>
      </div>

      {/* Right side - Cart */}
      <div className="w-80 flex-shrink-0">
        <Cart
          items={cart}
          customer={selectedCustomer}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
          onCheckout={() => setIsCheckoutOpen(true)}
          onSelectCustomer={() => setIsCustomerDialogOpen(true)}
        />
      </div>

      {/* Dialogs */}
      <CheckoutDialog
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        customer={selectedCustomer}
        onConfirm={handleCheckout}
      />
      
      <CustomerDialog
        open={isCustomerDialogOpen}
        onClose={() => setIsCustomerDialogOpen(false)}
        onSelectCustomer={setSelectedCustomer}
        selectedCustomer={selectedCustomer}
      />
    </div>
  );
};
