import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartItem, Customer, Order } from "@/types/pos";
import { CreditCard, Banknote, Gift, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  customer: Customer | null;
  onConfirm: (params: {
    discount: number;
    pointsRedeemed: number;
    paymentMethod: string;
  }) => Promise<Order>;
}

export const CheckoutDialog = ({ open, onClose, cart, customer, onConfirm }: CheckoutDialogProps) => {
  const [discount, setDiscount] = useState(0);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const pointsDiscount = pointsRedeemed * 0.01;
  const total = Math.max(0, subtotal + tax - discount - pointsDiscount);
  const maxPoints = customer?.loyalty_points || 0;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const order = await onConfirm({ discount, pointsRedeemed, paymentMethod });
      setCompletedOrder(order);
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setCompletedOrder(null);
    setDiscount(0);
    setPointsRedeemed(0);
    onClose();
  };

  if (completedOrder) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-card border-border max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground">Order #{completedOrder.id.slice(0, 8)}</p>
            
            {/* Receipt preview */}
            <div className="receipt-content mt-6 p-4 bg-secondary/30 rounded-lg text-left text-sm">
              <div className="text-center mb-4">
                <h3 className="font-bold">Restaurant POS</h3>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
              </div>
              <div className="border-t border-dashed border-border pt-2 space-y-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-border mt-2 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {(discount > 0 || pointsDiscount > 0) && (
                  <div className="flex justify-between text-accent">
                    <span>Discount</span>
                    <span>-${(discount + pointsDiscount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              {customer && (
                <div className="border-t border-dashed border-border mt-2 pt-2 text-center text-xs">
                  <p>Points earned: +{completedOrder.points_earned}</p>
                  <p>Thank you, {customer.name}!</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handlePrint} className="flex-1">
                Print Receipt
              </Button>
              <Button onClick={handleClose} className="flex-1 bg-primary text-primary-foreground">
                New Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment method */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={cn(
                  "p-4 rounded-lg border flex flex-col items-center gap-2 transition-all",
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-sm font-medium">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "p-4 rounded-lg border flex flex-col items-center gap-2 transition-all",
                  paymentMethod === "card"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-sm font-medium">Card</span>
              </button>
            </div>
          </div>

          {/* Discount */}
          <div>
            <Label htmlFor="discount" className="text-sm text-muted-foreground">
              Discount ($)
            </Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              className="bg-secondary border-border"
            />
          </div>

          {/* Loyalty points */}
          {customer && maxPoints > 0 && (
            <div>
              <Label htmlFor="points" className="text-sm text-muted-foreground flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" />
                Redeem Points (max {maxPoints})
              </Label>
              <Input
                id="points"
                type="number"
                min="0"
                max={maxPoints}
                value={pointsRedeemed || ""}
                onChange={(e) => setPointsRedeemed(Math.min(Number(e.target.value) || 0, maxPoints))}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                = ${(pointsRedeemed * 0.01).toFixed(2)} discount
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {(discount > 0 || pointsDiscount > 0) && (
              <div className="flex justify-between text-sm text-accent">
                <span>Discount</span>
                <span>-${(discount + pointsDiscount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full h-12 bg-primary text-primary-foreground font-semibold glow-primary"
          >
            {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
