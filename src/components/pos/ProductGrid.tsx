import { Product } from "@/types/pos";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => {
        const isLowStock = product.stock_quantity <= (product.low_stock_threshold || 10);
        const isOutOfStock = product.stock_quantity <= 0;
        
        return (
          <button
            key={product.id}
            onClick={() => !isOutOfStock && onAddToCart(product)}
            disabled={isOutOfStock}
            className={cn(
              "relative p-4 rounded-xl text-left transition-all duration-200 animate-scale-in",
              "bg-card border border-border hover:border-primary/50",
              "flex flex-col justify-between min-h-[120px]",
              isOutOfStock 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            )}
          >
            {isLowStock && !isOutOfStock && (
              <div className="absolute top-2 right-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Stock: {product.stock_quantity}
              </p>
            </div>
            
            <div className="mt-2">
              <span className="text-lg font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
            </div>
            
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                <span className="text-destructive font-semibold text-sm">Out of Stock</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
