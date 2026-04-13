import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
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
    if (s === 'completed') return 'bg-success text-success-foreground';
    if (s === 'cancelled') return 'bg-destructive text-destructive-foreground';
    return 'bg-warning text-warning-foreground';
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Order History</h1>
        <p className="page-subtitle">View and filter past orders</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
        </div>
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div className="bg-card rounded-lg border shadow-sm overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="table-header">Order ID</TableHead>
              <TableHead className="table-header">Type</TableHead>
              <TableHead className="table-header">Items</TableHead>
              <TableHead className="table-header text-right">Total</TableHead>
              <TableHead className="table-header">Status</TableHead>
              <TableHead className="table-header">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(o => (
              <TableRow key={o.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{o.id}</TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{o.type}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{o.items.map(i => `${i.productName} (×${i.quantity})`).join(', ')}</TableCell>
                <TableCell className="text-right font-medium">${o.totalAmount.toFixed(2)}</TableCell>
                <TableCell><Badge className={`text-[10px] capitalize ${statusColor(o.status)}`}>{o.status}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{o.createdAt}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
