import { motion } from 'framer-motion';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/currency';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, TrendingUp, Percent } from 'lucide-react';

const COLORS = ['hsl(221,83%,53%)', 'hsl(162,63%,41%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(250,75%,60%)', 'hsl(190,80%,42%)'];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 250, damping: 22 } } };

export default function Analytics() {
  const { products, orders } = useInventory();

  const salesByProduct = orders.filter(o => o.type === 'sales').flatMap(o => o.items).reduce((acc, i) => {
    const ex = acc.find(x => x.name === i.productName);
    if (ex) ex.revenue += i.quantity * i.unitPrice; else acc.push({ name: i.productName, revenue: i.quantity * i.unitPrice });
    return acc;
  }, [] as { name: string; revenue: number }[]).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  const inventoryByCategory = products.reduce((acc, p) => {
    const ex = acc.find(x => x.name === p.category);
    const val = p.price * p.quantity;
    if (ex) ex.value += val; else acc.push({ name: p.category, value: val });
    return acc;
  }, [] as { name: string; value: number }[]);

  const stockDistribution = products.map(p => ({
    name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
    stock: p.quantity,
    reorder: p.reorderLevel,
  })).sort((a, b) => a.stock - b.stock).slice(0, 8);

  const orderTrend = orders.reduce((acc, o) => {
    const ex = acc.find(x => x.date === o.createdAt);
    if (ex) { ex[o.type] = (ex[o.type] || 0) + o.totalAmount; } else { acc.push({ date: o.createdAt, [o.type]: o.totalAmount } as any); }
    return acc;
  }, [] as any[]).sort((a: any, b: any) => a.date.localeCompare(b.date));

  const totalRevenue = orders.filter(o => o.type === 'sales').reduce((s, o) => s + o.totalAmount, 0);
  const totalCost = orders.filter(o => o.type === 'purchase').reduce((s, o) => s + o.totalAmount, 0);
  const margin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100) : 0;

  const tooltipStyle = { borderRadius: '10px', border: '1px solid hsl(220,13%,91%)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' };

  const stats = [
    { label: 'Total Revenue', value: formatINR(totalRevenue), icon: TrendingUp, gradient: 'from-success to-[hsl(160,60%,50%)]', bg: 'bg-success/10' },
    { label: 'Total Purchases', value: formatINR(totalCost), icon: IndianRupee, gradient: 'from-primary to-[hsl(250,75%,60%)]', bg: 'bg-primary/10' },
    { label: 'Gross Margin', value: `${margin.toFixed(1)}%`, icon: Percent, gradient: 'from-accent to-[hsl(180,60%,50%)]', bg: 'bg-accent/10' },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Insights and performance metrics</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={container} initial="hidden" animate="show">
        {stats.map((s) => (
          <motion.div key={s.label} className="stat-card group relative overflow-hidden" variants={item}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`icon-box ${s.bg}`}>
                <s.icon className="h-4 w-4 text-foreground/60" />
              </div>
            </div>
            <motion.div className="text-2xl font-bold tracking-tight" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {s.value}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="stat-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold">Revenue by Product</h3>
            <Badge variant="secondary" className="text-[10px]">INR</Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesByProduct} barCategoryGap="20%">
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [formatINR(v), 'Revenue']} contentStyle={tooltipStyle} />
              <defs><linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(221,83%,53%)" /><stop offset="100%" stopColor="hsl(250,75%,60%)" /></linearGradient></defs>
              <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold">Inventory Value by Category</h3>
            <Badge variant="secondary" className="text-[10px]">INR</Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={inventoryByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} animationDuration={1000}>
                {inventoryByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-semibold mb-5">Stock vs Reorder Level</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stockDistribution} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} width={100} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="stock" fill="hsl(221,83%,53%)" radius={[0, 4, 4, 0]} name="Current Stock" animationDuration={1000} />
              <Bar dataKey="reorder" fill="hsl(0,72%,51%)" radius={[0, 4, 4, 0]} name="Reorder Level" opacity={0.3} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="text-sm font-semibold mb-5">Order Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={orderTrend}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatINR(Number(v))} contentStyle={tooltipStyle} />
              <defs>
                <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(162,63%,41%)" stopOpacity={0.2} /><stop offset="100%" stopColor="hsl(162,63%,41%)" stopOpacity={0} /></linearGradient>
                <linearGradient id="purchaseArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(221,83%,53%)" stopOpacity={0.2} /><stop offset="100%" stopColor="hsl(221,83%,53%)" stopOpacity={0} /></linearGradient>
              </defs>
              <Area type="monotone" dataKey="sales" stroke="hsl(162,63%,41%)" fill="url(#salesArea)" strokeWidth={2} name="Sales" animationDuration={1200} />
              <Area type="monotone" dataKey="purchase" stroke="hsl(221,83%,53%)" fill="url(#purchaseArea)" strokeWidth={2} name="Purchases" animationDuration={1400} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
