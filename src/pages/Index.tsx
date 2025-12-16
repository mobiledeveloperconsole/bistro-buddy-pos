import { useState } from "react";
import { POSTerminal } from "@/components/pos/POSTerminal";
import { StockManagement } from "@/components/admin/StockManagement";
import { SalesReports } from "@/components/admin/SalesReports";
import { LoyaltyDashboard } from "@/components/admin/LoyaltyDashboard";
import { cn } from "@/lib/utils";
import { ShoppingCart, Package, BarChart3, Gift, Store } from "lucide-react";

type Tab = "pos" | "stock" | "sales" | "loyalty";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("pos");

  const tabs = [
    { id: "pos" as Tab, label: "POS Terminal", icon: ShoppingCart },
    { id: "stock" as Tab, label: "Stock", icon: Package },
    { id: "sales" as Tab, label: "Sales", icon: BarChart3 },
    { id: "loyalty" as Tab, label: "Loyalty", icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">RestaurantPOS</h1>
            <p className="text-xs text-muted-foreground">Point of Sale System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="w-32" /> {/* Spacer for balance */}
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-hidden">
        <div className="h-full animate-fade-in">
          {activeTab === "pos" && <POSTerminal />}
          {activeTab === "stock" && <StockManagement />}
          {activeTab === "sales" && <SalesReports />}
          {activeTab === "loyalty" && <LoyaltyDashboard />}
        </div>
      </main>
    </div>
  );
};

export default Index;
