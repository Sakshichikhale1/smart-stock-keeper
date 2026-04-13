import { motion } from 'framer-motion';
import { Package, ShoppingCart, BarChart3, AlertTriangle } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

const iconMap = { product: Package, order: ShoppingCart, stock: BarChart3, alert: AlertTriangle };
const colorMap = { product: 'bg-primary/10 text-primary', order: 'bg-accent/10 text-accent', stock: 'bg-success/10 text-success', alert: 'bg-warning/10 text-warning' };

export default function ActivityLogPage() {
  const { activityLogs } = useInventory();

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Activity Log</h1>
        <p className="page-subtitle">Real-time system activity timeline</p>
      </motion.div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {activityLogs.map((log, i) => {
            const Icon = iconMap[log.type];
            const color = colorMap[log.type];
            return (
              <motion.div key={log.id} className="relative flex items-start gap-4 pl-10" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <div className={`absolute left-1 top-1 h-8 w-8 rounded-full flex items-center justify-center ${color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="stat-card flex-1 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{log.action}</span>
                    <span className="text-[11px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
