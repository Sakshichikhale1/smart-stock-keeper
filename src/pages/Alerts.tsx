import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, Package } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Alerts() {
  const { alerts, dismissAlert, products, createOrder } = useInventory();
  const active = alerts.filter(a => !a.dismissed);
  const dismissed = alerts.filter(a => a.dismissed);

  const autoReorder = (productId: string) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const qty = Math.max(p.reorderLevel * 2 - p.quantity, 10);
    createOrder({
      type: 'purchase',
      status: 'pending',
      items: [{ productId: p.id, productName: p.name, quantity: qty, unitPrice: p.costPrice }],
      notes: `Auto-generated reorder for ${p.name}`,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Smart Alerts</h1>
        <p className="page-subtitle">Proactive stock alerts and reorder suggestions</p>
      </motion.div>

      {active.length === 0 && (
        <motion.div className="stat-card text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">All stock levels are healthy!</p>
        </motion.div>
      )}

      <div className="space-y-3">
        {active.map((a, i) => (
          <motion.div key={a.id} className="stat-card flex items-start gap-4" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${a.type === 'out-of-stock' ? 'bg-destructive/10' : 'bg-warning/10'}`}>
              {a.type === 'out-of-stock' ? <XCircle className="h-5 w-5 text-destructive" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{a.productName}</span>
                <Badge className={`text-[10px] ${a.type === 'out-of-stock' ? 'bg-destructive text-destructive-foreground' : 'bg-warning text-warning-foreground'}`}>{a.type === 'out-of-stock' ? 'Out of Stock' : 'Low Stock'}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{a.message}</p>
              <p className="text-xs text-muted-foreground mt-1">Current: {a.currentStock} · Reorder at: {a.reorderLevel}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => autoReorder(a.productId)}>Auto Reorder</Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => dismissAlert(a.id)}>Dismiss</Button>
            </div>
          </motion.div>
        ))}
      </div>

      {dismissed.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Dismissed ({dismissed.length})</h3>
          <div className="space-y-2">
            {dismissed.map(a => (
              <div key={a.id} className="stat-card opacity-50 flex items-center gap-3 py-3">
                <span className="text-sm">{a.productName}</span>
                <span className="text-xs text-muted-foreground">{a.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
