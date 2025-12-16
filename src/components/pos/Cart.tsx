import { CartItem, Customer } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, User, Gift } from "lucide-react";

interface CartProps {
  items: CartItem[];
  customer: Customer | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onSelectCustomer: () => void;
}

export const Cart = ({
  items,
  customer,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onSelectCustomer,
}: CartProps) => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Current Order</h2>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Clear
            </Button>
          )}
        </div>
        
        {/* Customer selection */}
        <button
          onClick={onSelectCustomer}
          className="mt-3 w-full flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <User className="w-4 h-4 text-muted-foreground" />
          {customer ? (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{customer.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Gift className="w-3 h-3" />
                {customer.loyalty_points || 0} points
              </p>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Add customer (optional)</span>
          )}
        </button>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs mt-1">Tap items to add them</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 animate-fade-in"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${item.product.price.toFixed(2)} each
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="w-7 h-7 rounded-md bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors ml-1"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span className="text-foreground">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
          <span className="text-foreground">Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
        
        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 glow-primary"
        >
          Checkout ${total.toFixed(2)}
        </Button>
      </div>
    </div>
  );
};
