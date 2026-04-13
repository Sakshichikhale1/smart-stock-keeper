import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Product, Order, OrderItem, ActivityLog, Alert } from '@/types/inventory';

const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', price: 29.99, costPrice: 15.00, quantity: 45, reorderLevel: 20, supplier: 'TechParts Inc', createdAt: '2025-01-15', updatedAt: '2025-04-10' },
  { id: '2', name: 'USB-C Cable', sku: 'UC-002', category: 'Accessories', price: 12.99, costPrice: 4.50, quantity: 8, reorderLevel: 30, supplier: 'CableCo', createdAt: '2025-02-01', updatedAt: '2025-04-12' },
  { id: '3', name: 'Mechanical Keyboard', sku: 'MK-003', category: 'Electronics', price: 89.99, costPrice: 45.00, quantity: 120, reorderLevel: 15, supplier: 'KeyTech', createdAt: '2025-01-20', updatedAt: '2025-04-08' },
  { id: '4', name: 'Monitor Stand', sku: 'MS-004', category: 'Furniture', price: 49.99, costPrice: 22.00, quantity: 3, reorderLevel: 10, supplier: 'DeskPro', createdAt: '2025-03-01', updatedAt: '2025-04-11' },
  { id: '5', name: 'Webcam HD', sku: 'WC-005', category: 'Electronics', price: 69.99, costPrice: 30.00, quantity: 62, reorderLevel: 20, supplier: 'TechParts Inc', createdAt: '2025-02-15', updatedAt: '2025-04-09' },
  { id: '6', name: 'Desk Lamp', sku: 'DL-006', category: 'Furniture', price: 34.99, costPrice: 14.00, quantity: 0, reorderLevel: 10, supplier: 'LightWorks', createdAt: '2025-03-10', updatedAt: '2025-04-13' },
  { id: '7', name: 'Notebook A5', sku: 'NB-007', category: 'Stationery', price: 5.99, costPrice: 1.50, quantity: 200, reorderLevel: 50, supplier: 'PaperHouse', createdAt: '2025-01-05', updatedAt: '2025-03-20' },
  { id: '8', name: 'Ergonomic Chair', sku: 'EC-008', category: 'Furniture', price: 299.99, costPrice: 150.00, quantity: 12, reorderLevel: 5, supplier: 'DeskPro', createdAt: '2025-02-20', updatedAt: '2025-04-06' },
];

const SAMPLE_ORDERS: Order[] = [
  { id: 'ORD-001', type: 'sales', status: 'completed', items: [{ productId: '1', productName: 'Wireless Mouse', quantity: 5, unitPrice: 29.99 }, { productId: '3', productName: 'Mechanical Keyboard', quantity: 2, unitPrice: 89.99 }], totalAmount: 329.93, createdAt: '2025-04-10', updatedAt: '2025-04-10' },
  { id: 'ORD-002', type: 'purchase', status: 'pending', items: [{ productId: '2', productName: 'USB-C Cable', quantity: 50, unitPrice: 4.50 }], totalAmount: 225.00, createdAt: '2025-04-12', updatedAt: '2025-04-12' },
  { id: 'ORD-003', type: 'sales', status: 'pending', items: [{ productId: '5', productName: 'Webcam HD', quantity: 10, unitPrice: 69.99 }], totalAmount: 699.90, createdAt: '2025-04-13', updatedAt: '2025-04-13' },
];

interface InventoryContextType {
  products: Product[];
  orders: Order[];
  activityLogs: ActivityLog[];
  alerts: Alert[];
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  createOrder: (o: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  dismissAlert: (id: string) => void;
  generateAlerts: () => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
};

const genId = () => Math.random().toString(36).substr(2, 9);
const now = () => new Date().toISOString().split('T')[0];

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [activityLogs, setLogs] = useState<ActivityLog[]>([
    { id: '1', action: 'Product Added', details: 'Wireless Mouse added to inventory', timestamp: '2025-04-10T09:00:00', type: 'product' },
    { id: '2', action: 'Order Created', details: 'Sales order ORD-001 created', timestamp: '2025-04-10T10:30:00', type: 'order' },
    { id: '3', action: 'Stock Updated', details: 'USB-C Cable stock reduced to 8 units', timestamp: '2025-04-12T14:00:00', type: 'stock' },
    { id: '4', action: 'Low Stock Alert', details: 'Monitor Stand below reorder level', timestamp: '2025-04-13T08:00:00', type: 'alert' },
  ]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addLog = useCallback((action: string, details: string, type: ActivityLog['type']) => {
    setLogs(prev => [{ id: genId(), action, details, timestamp: new Date().toISOString(), type }, ...prev]);
  }, []);

  const generateAlerts = useCallback(() => {
    const newAlerts: Alert[] = products
      .filter(p => p.quantity <= p.reorderLevel)
      .map(p => ({
        id: genId(),
        productId: p.id,
        productName: p.name,
        type: p.quantity === 0 ? 'out-of-stock' as const : 'low-stock' as const,
        message: p.quantity === 0 ? `${p.name} is out of stock!` : `${p.name} is below reorder level (${p.quantity}/${p.reorderLevel})`,
        currentStock: p.quantity,
        reorderLevel: p.reorderLevel,
        timestamp: new Date().toISOString(),
        dismissed: false,
      }));
    setAlerts(newAlerts);
  }, [products]);

  useEffect(() => { generateAlerts(); }, [products, generateAlerts]);

  const addProduct = useCallback((p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const product = { ...p, id: genId(), createdAt: now(), updatedAt: now() };
    setProducts(prev => [...prev, product]);
    addLog('Product Added', `${p.name} (${p.sku}) added`, 'product');
  }, [addLog]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: now() } : p));
    addLog('Product Updated', `Product ${id} updated`, 'product');
  }, [addLog]);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => {
      const p = prev.find(x => x.id === id);
      if (p) addLog('Product Deleted', `${p.name} removed`, 'product');
      return prev.filter(x => x.id !== id);
    });
  }, [addLog]);

  const createOrder = useCallback((o: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount'>) => {
    const total = o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const order: Order = { ...o, id: `ORD-${String(orders.length + 1).padStart(3, '0')}`, totalAmount: total, createdAt: now(), updatedAt: now() };
    setOrders(prev => [...prev, order]);

    // Auto-update inventory
    if (o.type === 'sales') {
      setProducts(prev => prev.map(p => {
        const item = o.items.find(i => i.productId === p.id);
        return item ? { ...p, quantity: Math.max(0, p.quantity - item.quantity), updatedAt: now() } : p;
      }));
    } else {
      setProducts(prev => prev.map(p => {
        const item = o.items.find(i => i.productId === p.id);
        return item ? { ...p, quantity: p.quantity + item.quantity, updatedAt: now() } : p;
      }));
    }
    addLog('Order Created', `${o.type} order created with ${o.items.length} items ($${total.toFixed(2)})`, 'order');
  }, [orders.length, addLog]);

  const updateOrderStatus = useCallback((id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, updatedAt: now() } : o));
    addLog('Order Updated', `Order ${id} marked as ${status}`, 'order');
  }, [addLog]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  }, []);

  return (
    <InventoryContext.Provider value={{ products, orders, activityLogs, alerts, addProduct, updateProduct, deleteProduct, createOrder, updateOrderStatus, dismissAlert, generateAlerts }}>
      {children}
    </InventoryContext.Provider>
  );
};
