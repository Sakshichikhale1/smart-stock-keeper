import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, Package, Zap, ShieldCheck } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, x: -16, scale: 0.98 }, show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 250, damping: 22 } } };

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
    toast.success(`Purchase order created for ${qty} units of ${p.name}! 📦`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title">Smart Alerts</h1>
        <p className="page-subtitle">Proactive stock alerts and auto-reorder suggestions</p>
      </motion.div>

      {active.length === 0 && (
        <motion.div className="stat-card text-center py-16" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
            <ShieldCheck className="h-14 w-14 mx-auto text-success/40 mb-4" />
          </motion.div>
          <p className="text-foreground font-medium mb-1">All stock levels are healthy!</p>
          <p className="text-sm text-muted-foreground">No alerts to show at the moment.</p>
        </motion.div>
      )}

      <motion.div className="space-y-3" variants={container} initial="hidden" animate="show">
        <AnimatePresence>
          {active.map((a) => (
            <motion.div key={a.id} className="stat-card flex items-start gap-4 group" variants={item} exit={{ opacity: 0, x: -20, scale: 0.95 }}>
              <motion.div className={`icon-box shrink-0 ${a.type === 'out-of-stock' ? 'bg-destructive/10' : 'bg-warning/10'}`} whileHover={{ scale: 1.1, rotate: 5 }}>
                {a.type === 'out-of-stock' ? <XCircle className="h-5 w-5 text-destructive" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-sm">{a.productName}</span>
                  <Badge className={`text-[10px] ${a.type === 'out-of-stock' ? 'bg-destructive/15 text-destructive border-destructive/20' : 'bg-warning/15 text-warning border-warning/20'}`}>
                    {a.type === 'out-of-stock' ? 'Out of Stock' : 'Low Stock'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{a.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">Current: <span className="font-semibold text-foreground">{a.currentStock}</span></span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">Reorder at: <span className="font-semibold text-foreground">{a.reorderLevel}</span></span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="default" className="h-8 text-xs gap-1.5 shadow-sm hover:shadow-md transition-shadow" onClick={() => autoReorder(a.productId)}>
                  <Zap className="h-3 w-3" /> Auto Reorder
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => dismissAlert(a.id)}>Dismiss</Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {dismissed.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Dismissed ({dismissed.length})</h3>
          <div className="space-y-2">
            {dismissed.map(a => (
              <div key={a.id} className="stat-card opacity-40 flex items-center gap-3 py-3">
                <span className="text-sm">{a.productName}</span>
                <span className="text-xs text-muted-foreground">{a.message}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
