import { useMemo, useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from "date-fns";

const COLORS = ["hsl(32, 95%, 55%)", "hsl(160, 70%, 45%)", "hsl(45, 95%, 55%)", "hsl(0, 75%, 55%)"];

export const SalesReports = () => {
  const [dateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  const { data: orders = [] } = useOrders(dateRange);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalTax = orders.reduce((sum, o) => sum + (o.tax || 0), 0);

    return { totalRevenue, totalOrders, avgOrderValue, totalTax };
  }, [orders]);

  const dailySales = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });
      
      return {
        date: format(day, "MMM dd"),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      };
    });
  }, [orders, dateRange]);

  const paymentMethodData = useMemo(() => {
    const methods: Record<string, number> = {};
    orders.forEach((o) => {
      const method = o.payment_method || "cash";
      methods[method] = (methods[method] || 0) + o.total;
    });
    
    return Object.entries(methods).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [orders]);

  const recentOrders = orders.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sales Reports</h2>
        <p className="text-muted-foreground">Last 30 days overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground">${stats.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tax</p>
              <p className="text-2xl font-bold text-foreground">${stats.totalTax.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(32, 95%, 55%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Orders</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" fill="hsl(160, 70%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment methods and recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment methods */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentMethodData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), "MMM dd, HH:mm")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    ${order.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {order.payment_method}
                  </p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                No orders yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
