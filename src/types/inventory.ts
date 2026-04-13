export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  quantity: number;
  reorderLevel: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  type: 'sales' | 'purchase';
  status: 'pending' | 'completed' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'product' | 'order' | 'stock' | 'alert';
}

export interface Alert {
  id: string;
  productId: string;
  productName: string;
  type: 'low-stock' | 'out-of-stock' | 'dead-stock';
  message: string;
  currentStock: number;
  reorderLevel: number;
  timestamp: string;
  dismissed: boolean;
}
