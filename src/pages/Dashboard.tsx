import { motion } from 'framer-motion';
import { Package, ShoppingCart, DollarSign, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function Dashboard() {
  const { products, orders, alerts } = useInventory();

  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const totalItems = products.reduce((s, p) => s + p.quantity, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeAlerts = alerts.filter(a => !a.dismissed).length;

  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find(c => c.name === p.category);
    if (existing) { existing.value += p.quantity; } else { acc.push({ name: p.category, value: p.quantity }); }
    return acc;
  }, [] as { name: string; value: number }[]);

  const topProducts = [...products].sort((a, b) => b.quantity * b.price - a.quantity * a.price).slice(0, 5).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    value: Math.round(p.quantity * p.price),
  }));

  const COLORS = ['hsl(217,91%,50%)', 'hsl(168,71%,39%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(280,65%,60%)'];

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Items', value: totalItems.toLocaleString(), icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Inventory Value', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pending Orders', value: pendingOrders, icon: ShoppingCart, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Active Alerts', value: activeAlerts, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel).slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div {...fade}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your inventory operations</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</span>
              <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="stat-card" {...fade} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold mb-4">Top Products by Value</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Value']} />
              <Bar dataKey="value" fill="hsl(217,91%,50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="stat-card" {...fade} transition={{ delay: 0.25 }}>
          <h3 className="text-sm font-semibold mb-4">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {lowStockProducts.length > 0 && (
        <motion.div className="stat-card" {...fade} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold">Low Stock Items</h3>
          </div>
          <div className="space-y-3">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{p.sku}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${p.quantity === 0 ? 'text-destructive' : 'text-warning'}`}>
                    {p.quantity} units
                  </span>
                  <span className="text-xs text-muted-foreground">/ {p.reorderLevel} min</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
