import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, History, FileText } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/currency';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrderHistory() {
  const { orders } = useInventory();
  const [typeFilter, setTypeFilter] = useState<'all' | 'sales' | 'purchase'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => {
    if (typeFilter !== 'all' && o.type !== typeFilter) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.items.some(i => i.productName.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const statusColor = (s: string) => {
    if (s === 'completed') return 'bg-success/15 text-success border-success/20';
    if (s === 'cancelled') return 'bg-destructive/15 text-destructive border-destructive/20';
    return 'bg-warning/15 text-warning border-warning/20';
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title">Order History</h1>
        <p className="page-subtitle">View and filter past orders</p>
      </motion.div>

      <motion.div className="flex flex-col sm:flex-row gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 bg-card" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full p-0.5"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
        </div>
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
          <SelectTrigger className="w-40 h-10 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40 h-10 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div className="bg-card rounded-xl border overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ boxShadow: 'var(--shadow-card)' }}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="table-header">Order ID</TableHead>
              <TableHead className="table-header">Type</TableHead>
              <TableHead className="table-header">Items</TableHead>
              <TableHead className="table-header text-right">Total</TableHead>
              <TableHead className="table-header">Status</TableHead>
              <TableHead className="table-header">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filtered.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }} className="border-b hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold text-sm">{o.id}</TableCell>
                  <TableCell><Badge variant="secondary" className={`text-[10px] capitalize font-medium ${o.type === 'sales' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>{o.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{o.items.map(i => `${i.productName} (×${i.quantity})`).join(', ')}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatINR(o.totalAmount)}</TableCell>
                  <TableCell><Badge className={`text-[10px] capitalize ${statusColor(o.status)}`}>{o.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.createdAt}</TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                No orders found
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
