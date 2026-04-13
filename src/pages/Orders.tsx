import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { OrderItem } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Orders() {
  const { products, orders, createOrder, updateOrderStatus } = useInventory();
  const [orderType, setOrderType] = useState<'sales' | 'purchase'>('sales');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  const addItem = () => {
    const p = products.find(x => x.id === selectedProduct);
    if (!p) return;
    if (items.find(i => i.productId === p.id)) { toast.error('Product already added'); return; }
    setItems([...items, { productId: p.id, productName: p.name, quantity: qty, unitPrice: orderType === 'purchase' ? p.costPrice : p.price }]);
    setSelectedProduct(''); setQty(1);
  };

  const removeItem = (pid: string) => setItems(items.filter(i => i.productId !== pid));

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const submitOrder = () => {
    if (items.length === 0) { toast.error('Add at least one product'); return; }
    createOrder({ type: orderType, status: 'pending', items, notes });
    setItems([]); setNotes('');
    toast.success('Order created successfully');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Create Order</h1>
        <p className="page-subtitle">Create sales or purchase orders</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 stat-card space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex gap-2">
            <Button variant={orderType === 'sales' ? 'default' : 'secondary'} onClick={() => setOrderType('sales')} className="flex-1">Sales Order</Button>
            <Button variant={orderType === 'purchase' ? 'default' : 'secondary'} onClick={() => setOrderType('purchase')} className="flex-1">Purchase Order</Button>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label>Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.quantity} in stock)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Label>Qty</Label>
              <Input type="number" min={1} value={qty} onChange={e => setQty(+e.target.value)} />
            </div>
            <Button onClick={addItem} size="icon"><Plus className="h-4 w-4" /></Button>
          </div>

          {items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-header">Product</TableHead>
                  <TableHead className="table-header text-right">Qty</TableHead>
                  <TableHead className="table-header text-right">Unit Price</TableHead>
                  <TableHead className="table-header text-right">Subtotal</TableHead>
                  <TableHead className="table-header w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(i => (
                  <TableRow key={i.productId}>
                    <TableCell className="font-medium">{i.productName}</TableCell>
                    <TableCell className="text-right">{i.quantity}</TableCell>
                    <TableCell className="text-right">${i.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${(i.quantity * i.unitPrice).toFixed(2)}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(i.productId)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-lg font-semibold">Total: ${total.toFixed(2)}</span>
            <Button onClick={submitOrder} disabled={items.length === 0}>Create Order</Button>
          </div>
        </motion.div>

        <motion.div className="stat-card space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h3 className="text-sm font-semibold">Pending Orders ({pendingOrders.length})</h3>
          {pendingOrders.length === 0 && <p className="text-sm text-muted-foreground">No pending orders</p>}
          {pendingOrders.map(o => (
            <div key={o.id} className="p-3 rounded-lg border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{o.id}</span>
                <Badge variant="secondary" className="text-[10px]">{o.type}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{o.items.length} items · ${o.totalAmount.toFixed(2)}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="default" className="flex-1 h-7 text-xs" onClick={() => { updateOrderStatus(o.id, 'completed'); toast.success('Order completed'); }}>Complete</Button>
                <Button size="sm" variant="secondary" className="flex-1 h-7 text-xs" onClick={() => { updateOrderStatus(o.id, 'cancelled'); toast('Order cancelled'); }}>Cancel</Button>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
