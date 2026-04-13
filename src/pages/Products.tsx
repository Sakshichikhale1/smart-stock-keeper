import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const emptyForm = { name: '', sku: '', category: '', price: 0, costPrice: 0, quantity: 0, reorderLevel: 10, supplier: '' };

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Product>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (key: keyof Product) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditId(p.id); setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, costPrice: p.costPrice, quantity: p.quantity, reorderLevel: p.reorderLevel, supplier: p.supplier }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.sku) return;
    if (editId) updateProduct(editId, form);
    else addProduct(form);
    setDialogOpen(false);
  };

  const stockBadge = (p: Product) => {
    if (p.quantity === 0) return <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>;
    if (p.quantity <= p.reorderLevel) return <Badge className="bg-warning text-warning-foreground text-[10px]">Low Stock</Badge>;
    return <Badge className="bg-success text-success-foreground text-[10px]">In Stock</Badge>;
  };

  const SortIcon = ({ k }: { k: keyof Product }) => sortKey === k ? <span className="ml-1 text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span> : null;

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Products</h1>
        <p className="page-subtitle">Manage your inventory catalog</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
      </div>

      <motion.div className="bg-card rounded-lg border shadow-sm overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header cursor-pointer" onClick={() => toggleSort('name')}>Name<SortIcon k="name" /></TableHead>
                <TableHead className="table-header cursor-pointer" onClick={() => toggleSort('sku')}>SKU<SortIcon k="sku" /></TableHead>
                <TableHead className="table-header cursor-pointer" onClick={() => toggleSort('category')}>Category<SortIcon k="category" /></TableHead>
                <TableHead className="table-header cursor-pointer text-right" onClick={() => toggleSort('price')}>Price<SortIcon k="price" /></TableHead>
                <TableHead className="table-header cursor-pointer text-right" onClick={() => toggleSort('quantity')}>Stock<SortIcon k="quantity" /></TableHead>
                <TableHead className="table-header">Status</TableHead>
                <TableHead className="table-header text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filtered.map(p => (
                  <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.sku}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[11px]">{p.category}</Badge></TableCell>
                    <TableCell className="text-right">${p.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">{p.quantity}</TableCell>
                    <TableCell>{stockBadge(p)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Supplier</Label><Input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></div>
              <div><Label>Cost Price</Label><Input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: +e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} /></div>
              <div><Label>Reorder Level</Label><Input type="number" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: +e.target.value })} /></div>
            </div>
            <Button onClick={handleSave} className="w-full mt-2">{editId ? 'Update Product' : 'Add Product'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
