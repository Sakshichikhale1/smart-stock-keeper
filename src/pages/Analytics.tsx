import { motion } from 'framer-motion';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/currency';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, TrendingUp, Percent, Target, Clock, ArrowUpDown } from 'lucide-react';

const COLORS = ['hsl(221,83%,53%)', 'hsl(162,63%,41%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(250,75%,60%)', 'hsl(190,80%,42%)'];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 250, damping: 22 } } };

export default function Analytics() {
  const { products, orders } = useInventory();

  const salesOrders = orders.filter(o => o.type === 'sales');
  const purchaseOrders = orders.filter(o => o.type === 'purchase');

  const totalRevenue = salesOrders.reduce((s, o) => s + o.gstBreakdown.taxableAmount, 0);
  const totalCost = salesOrders.flatMap(o => o.items).reduce((s, i) => s + i.costPrice * i.quantity, 0);
  const totalProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
  const totalPurchases = purchaseOrders.reduce((s, o) => s + o.totalAmount, 0);

  // Profit per order
  const orderProfits = salesOrders.map(o => {
    const revenue = o.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const cost = o.items.reduce((s, i) => s + i.costPrice * i.quantity, 0);
    return { id: o.id, revenue, cost, profit: revenue - cost, margin: revenue > 0 ? ((revenue - cost) / revenue * 100) : 0 };
  });

  // Pareto analysis - top 20% products
  const productRevenue = salesOrders.flatMap(o => o.items).reduce((acc, i) => {
    acc[i.productName] = (acc[i.productName] || 0) + i.unitPrice * i.quantity;
    return acc;
  }, {} as Record<string, number>);
  const sortedProducts = Object.entries(productRevenue).sort(([, a], [, b]) => b - a);
  const totalProductRevenue = sortedProducts.reduce((s, [, v]) => s + v, 0);
  let cumulative = 0;
  const paretoData = sortedProducts.map(([name, revenue]) => {
    cumulative += revenue;
    return { name: name.length > 14 ? name.slice(0, 14) + '…' : name, revenue, cumPct: Math.round(cumulative / totalProductRevenue * 100) };
  });

  // Inventory turnover
  const avgInventoryValue = products.reduce((s, p) => s + p.costPrice * p.quantity, 0);
  const turnoverRatio = avgInventoryValue > 0 ? (totalCost / avgInventoryValue) : 0;

  // Aging inventory
  const today = new Date();
  const agingData = products.map(p => {
    const daysSinceUpdate = Math.floor((today.getTime() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    return { ...p, daysSinceUpdate };
  }).sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate).slice(0, 8);

  // Revenue by product for bar chart
  const salesByProduct = salesOrders.flatMap(o => o.items).reduce((acc, i) => {
    const ex = acc.find(x => x.name === i.productName);
    if (ex) ex.revenue += i.quantity * i.unitPrice; else acc.push({ name: i.productName.length > 12 ? i.productName.slice(0, 12) + '…' : i.productName, revenue: i.quantity * i.unitPrice });
    return acc;
  }, [] as { name: string; revenue: number }[]).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Inventory value by category
  const inventoryByCategory = products.reduce((acc, p) => {
    const ex = acc.find(x => x.name === p.category);
    const val = p.price * p.quantity;
    if (ex) ex.value += val; else acc.push({ name: p.category, value: val });
    return acc;
  }, [] as { name: string; value: number }[]);

  // GST collected
  const totalGSTCollected = salesOrders.reduce((s, o) => s + o.gstBreakdown.totalTax, 0);

  const tooltipStyle = { borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px', backgroundColor: 'hsl(var(--card))' };

  const stats = [
    { label: 'Total Revenue', value: formatINR(totalRevenue), icon: TrendingUp, gradient: 'from-success to-[hsl(160,60%,50%)]', bg: 'bg-success/10' },
    { label: 'Gross Profit', value: formatINR(totalProfit), icon: IndianRupee, gradient: 'from-primary to-[hsl(250,75%,60%)]', bg: 'bg-primary/10' },
    { label: 'Profit Margin', value: `${margin.toFixed(1)}%`, icon: Percent, gradient: 'from-accent to-[hsl(180,60%,50%)]', bg: 'bg-accent/10' },
    { label: 'GST Collected', value: formatINR(totalGSTCollected), icon: Receipt, gradient: 'from-warning to-[hsl(25,95%,53%)]', bg: 'bg-warning/10' },
    { label: 'Inventory Turnover', value: turnoverRatio.toFixed(2) + 'x', icon: ArrowUpDown, gradient: 'from-[hsl(250,75%,60%)] to-primary', bg: 'bg-[hsl(250,75%,60%)]/10' },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title">Analytics & Profit Tracking</h1>
        <p className="page-subtitle">Revenue insights, profit margins, and inventory intelligence</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" variants={container} initial="hidden" animate="show">
        {stats.map((s) => (
          <motion.div key={s.label} className="stat-card group relative overflow-hidden" variants={item}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`icon-box ${s.bg}`}>
                <s.icon className="h-4 w-4 text-foreground/60" />
              </div>
            </div>
            <motion.div className="text-xl font-bold tracking-tight" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [formatINR(v), 'Revenue']} contentStyle={tooltipStyle} />
              <defs><linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(221,83%,53%)" /><stop offset="100%" stopColor="hsl(250,75%,60%)" /></linearGradient></defs>
              <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[8, 8, 0, 0]} animationDuration={1200} />
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

        {/* Pareto Analysis */}
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold">Pareto Analysis (80/20)</h3>
              <p className="text-[11px] text-muted-foreground">Top products contributing to revenue</p>
            </div>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={paretoData}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="revenue" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar yAxisId="revenue" dataKey="revenue" fill="hsl(221,83%,53%)" radius={[6, 6, 0, 0]} opacity={0.8} animationDuration={1000} />
              <Line yAxisId="pct" dataKey="cumPct" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={{ r: 3 }} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Profit per Order */}
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold">Profit per Order</h3>
            <Badge variant="secondary" className="text-[10px]">Sales</Badge>
          </div>
          {orderProfits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No sales orders yet</div>
          ) : (
            <div className="space-y-3">
              {orderProfits.map((op, i) => (
                <motion.div key={op.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/30 transition-colors" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                  <div>
                    <span className="text-sm font-semibold">{op.id}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">Revenue: {formatINR(op.revenue)}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${op.profit > 0 ? 'text-success' : 'text-destructive'}`}>{formatINR(op.profit)}</span>
                    <div className={`text-[11px] font-medium ${op.margin > 30 ? 'text-success' : op.margin > 15 ? 'text-warning' : 'text-destructive'}`}>{op.margin.toFixed(1)}% margin</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Aging Inventory */}
      <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold">Aging Inventory Report</h3>
            <p className="text-[11px] text-muted-foreground">Products with longest time since last update</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agingData.map((p, i) => (
            <motion.div key={p.id} className="p-3 rounded-xl border hover:border-primary/20 transition-colors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.04 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate">{p.name}</span>
                <Badge variant={p.daysSinceUpdate > 30 ? 'destructive' : p.daysSinceUpdate > 14 ? 'secondary' : 'outline'} className="text-[10px] shrink-0">
                  {p.daysSinceUpdate}d
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">{p.quantity} units · {formatINR(p.price * p.quantity)}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Need Receipt icon
import { Receipt } from 'lucide-react';
