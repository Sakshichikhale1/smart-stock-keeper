import { motion } from 'framer-motion';
import { Package, ShoppingCart, AlertTriangle, TrendingDown, IndianRupee, Boxes, TrendingUp, Receipt } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/currency';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

export default function Dashboard() {
  const { products, orders, alerts } = useInventory();

  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const totalItems = products.reduce((s, p) => s + p.quantity, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeAlerts = alerts.filter(a => !a.dismissed).length;
  
  const salesOrders = orders.filter(o => o.type === 'sales');
  const totalRevenue = salesOrders.reduce((s, o) => s + o.gstBreakdown.taxableAmount, 0);
  const totalCost = salesOrders.flatMap(o => o.items).reduce((s, i) => s + i.costPrice * i.quantity, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalGST = orders.reduce((s, o) => s + o.gstBreakdown.totalTax, 0);

  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find(c => c.name === p.category);
    if (existing) { existing.value += p.quantity; } else { acc.push({ name: p.category, value: p.quantity }); }
    return acc;
  }, [] as { name: string; value: number }[]);

  const topProducts = [...products].sort((a, b) => b.quantity * b.price - a.quantity * a.price).slice(0, 5).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    value: Math.round(p.quantity * p.price),
  }));

  const COLORS = ['hsl(221,83%,53%)', 'hsl(162,63%,41%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(250,75%,60%)'];

  const stats = [
    { label: 'Total Products', value: String(products.length), icon: Package, gradient: 'from-primary to-[hsl(250,75%,60%)]', bg: 'bg-primary/10' },
    { label: 'Inventory Value', value: formatINR(totalValue), icon: IndianRupee, gradient: 'from-success to-[hsl(160,60%,50%)]', bg: 'bg-success/10' },
    { label: 'Total Profit', value: formatINR(totalProfit), icon: TrendingUp, gradient: 'from-accent to-[hsl(180,60%,50%)]', bg: 'bg-accent/10' },
    { label: 'GST Collected', value: formatINR(totalGST), icon: Receipt, gradient: 'from-warning to-[hsl(25,95%,53%)]', bg: 'bg-warning/10' },
    { label: 'Active Alerts', value: String(activeAlerts), icon: AlertTriangle, gradient: 'from-destructive to-[hsl(350,80%,55%)]', bg: 'bg-destructive/10' },
  ];

  const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel).slice(0, 5);

  const tooltipStyle = { borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: 'hsl(var(--card))' };

  return (
    <div className="space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your inventory operations</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" variants={container} initial="hidden" animate="show">
        {stats.map((s) => (
          <motion.div key={s.label} className="stat-card group relative overflow-hidden" variants={item}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
            <div className="flex items-center justify-between mb-3 relative">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`icon-box ${s.bg}`}>
                <s.icon className="h-4 w-4 text-foreground/70" />
              </div>
            </div>
            <motion.div className="text-2xl font-bold tracking-tight relative" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }}>
              {s.value}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="stat-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold">Top Products by Value</h3>
            <Badge variant="secondary" className="text-[10px] font-medium">INR</Badge>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={topProducts} barCategoryGap="20%">
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [formatINR(v), 'Value']} contentStyle={tooltipStyle} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(221,83%,53%)" />
                  <stop offset="100%" stopColor="hsl(250,75%,60%)" />
                </linearGradient>
              </defs>
              <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} animationDuration={1200} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold">Stock by Category</h3>
            <Badge variant="secondary" className="text-[10px] font-medium">Units</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value" animationDuration={1000} animationEasing="ease-out">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-3">
            {categoryData.map((c, i) => (
              <motion.div key={c.name} className="flex items-center gap-1.5 text-xs font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {c.name} <span className="text-muted-foreground">({c.value})</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {lowStockProducts.length > 0 && (
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="icon-box bg-destructive/10">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Low Stock Items</h3>
              <p className="text-[11px] text-muted-foreground">Products below reorder threshold</p>
            </div>
          </div>
          <div className="space-y-1">
            {lowStockProducts.map((p, i) => (
              <motion.div key={p.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-all duration-200 border-b last:border-0" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}>
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${p.quantity === 0 ? 'bg-destructive animate-pulse' : 'bg-warning'}`} />
                  <div>
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-[11px] text-muted-foreground ml-2">{p.sku}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`text-sm font-bold ${p.quantity === 0 ? 'text-destructive' : 'text-warning'}`}>
                      {p.quantity}
                    </span>
                    <span className="text-[11px] text-muted-foreground"> / {p.reorderLevel}</span>
                  </div>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${p.quantity === 0 ? 'bg-destructive' : 'bg-warning'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((p.quantity / p.reorderLevel) * 100, 100)}%` }}
                      transition={{ delay: 0.6 + i * 0.06, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
