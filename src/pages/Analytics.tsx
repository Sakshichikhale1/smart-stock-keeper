import { motion } from 'framer-motion';
import { useInventory } from '@/context/InventoryContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['hsl(217,91%,50%)', 'hsl(168,71%,39%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(280,65%,60%)', 'hsl(190,80%,42%)'];

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

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Insights and performance metrics</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: 'text-success' },
          { label: 'Total Purchases', value: `$${totalCost.toFixed(2)}`, color: 'text-primary' },
          { label: 'Gross Margin', value: `${margin.toFixed(1)}%`, color: 'text-accent' },
        ].map((s, i) => (
          <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</span>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h3 className="text-sm font-semibold mb-4">Revenue by Product</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesByProduct}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="hsl(217,91%,50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold mb-4">Inventory Value by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={inventoryByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {inventoryByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <h3 className="text-sm font-semibold mb-4">Stock vs Reorder Level</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stockDistribution} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <Tooltip />
              <Bar dataKey="stock" fill="hsl(217,91%,50%)" radius={[0, 4, 4, 0]} name="Current Stock" />
              <Bar dataKey="reorder" fill="hsl(0,72%,51%)" radius={[0, 4, 4, 0]} name="Reorder Level" opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-semibold mb-4">Order Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={orderTrend}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `$${Number(v).toFixed(2)}`} />
              <Area type="monotone" dataKey="sales" stroke="hsl(168,71%,39%)" fill="hsl(168,71%,39%)" fillOpacity={0.15} name="Sales" />
              <Area type="monotone" dataKey="purchase" stroke="hsl(217,91%,50%)" fill="hsl(217,91%,50%)" fillOpacity={0.15} name="Purchases" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
