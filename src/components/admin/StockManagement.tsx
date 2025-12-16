import { useAllProducts, useUpdateProduct, useCreateProduct } from "@/hooks/useProducts";
import { useCategories, useCreateCategory } from "@/hooks/useCategories";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Package, Plus, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const StockManagement = () => {
  const { data: products = [], isLoading } = useAllProducts();
  const { data: categories = [] } = useCategories();
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();
  const createCategory = useCreateCategory();
  const { toast } = useToast();

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "" });
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });
  const [editStock, setEditStock] = useState("");

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= (p.low_stock_threshold || 10)
  );

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ title: "Error", description: "Name and price required", variant: "destructive" });
      return;
    }
    
    try {
      await createProduct.mutateAsync({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock) || 0,
        category_id: newProduct.category || undefined,
      });
      toast({ title: "Success", description: "Product added" });
      setNewProduct({ name: "", price: "", stock: "", category: "" });
      setIsAddProductOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add product", variant: "destructive" });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({ title: "Error", description: "Name required", variant: "destructive" });
      return;
    }
    
    try {
      await createCategory.mutateAsync({
        name: newCategory.name,
        icon: newCategory.icon || undefined,
      });
      toast({ title: "Success", description: "Category added" });
      setNewCategory({ name: "", icon: "" });
      setIsAddCategoryOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add category", variant: "destructive" });
    }
  };

  const handleUpdateStock = async (productId: string) => {
    const newQuantity = parseInt(editStock);
    if (isNaN(newQuantity) || newQuantity < 0) {
      toast({ title: "Error", description: "Invalid quantity", variant: "destructive" });
      return;
    }
    
    try {
      await updateProduct.mutateAsync({ id: productId, stock_quantity: newQuantity });
      toast({ title: "Success", description: "Stock updated" });
      setEditingProduct(null);
      setEditStock("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Stock Management</h2>
          <p className="text-muted-foreground">Manage inventory and products</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Category
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label>Icon (emoji)</Label>
                  <Input
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    className="bg-secondary border-border"
                    placeholder="🍔"
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full bg-primary text-primary-foreground">
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddProduct} className="w-full bg-primary text-primary-foreground">
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Low Stock Alert</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map((product) => (
              <span
                key={product.id}
                className="px-3 py-1 bg-warning/20 rounded-full text-sm text-warning"
              >
                {product.name}: {product.stock_quantity} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Product</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Category</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Price</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Stock</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const category = categories.find((c) => c.id === product.category_id);
              const isLow = product.stock_quantity <= (product.low_stock_threshold || 10);
              const isOut = product.stock_quantity <= 0;
              
              return (
                <tr key={product.id} className="border-t border-border hover:bg-secondary/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {category ? `${category.icon} ${category.name}` : "—"}
                  </td>
                  <td className="p-4 text-foreground">${product.price.toFixed(2)}</td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          className="w-20 h-8 bg-secondary border-border"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStock(product.id)}
                          className="h-8"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingProduct(null)}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <span className={isOut ? "text-destructive" : isLow ? "text-warning" : "text-foreground"}>
                        {product.stock_quantity}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isOut
                          ? "bg-destructive/20 text-destructive"
                          : isLow
                          ? "bg-warning/20 text-warning"
                          : "bg-success/20 text-success"
                      }`}
                    >
                      {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product.id);
                        setEditStock(product.stock_quantity.toString());
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
