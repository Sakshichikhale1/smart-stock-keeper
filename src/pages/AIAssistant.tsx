import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  '📦 Which products need restocking?',
  '🚨 What\'s out of stock?',
  '📊 Show top selling products',
  '💰 Total inventory value',
  '📋 Inventory summary',
];

export default function AIAssistant() {
  const { products, orders, alerts } = useInventory();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "👋 Hi! I'm your AI inventory assistant. I can help you with stock levels, reorder suggestions, sales insights, and more.\n\nTry asking me a question or use the quick actions below!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const getResponse = (q: string): string => {
    const ql = q.toLowerCase();

    if (ql.includes('low stock') || ql.includes('restock') || ql.includes('reorder')) {
      const low = products.filter(p => p.quantity <= p.reorderLevel);
      if (low.length === 0) return "✅ All products are above their reorder levels. No restocking needed right now!";
      return `⚠️ **${low.length} products need restocking:**\n\n${low.map(p => `- **${p.name}** (${p.sku}): ${p.quantity} units left (reorder at ${p.reorderLevel}). Suggest ordering **${Math.max(p.reorderLevel * 2 - p.quantity, 10)} units** from ${p.supplier}.`).join('\n')}`;
    }

    if (ql.includes('out of stock') || ql.includes('no stock')) {
      const oos = products.filter(p => p.quantity === 0);
      if (oos.length === 0) return "✅ No products are out of stock!";
      return `🚨 **${oos.length} products are out of stock:**\n\n${oos.map(p => `- **${p.name}** (${p.sku}) — Supplier: ${p.supplier}`).join('\n')}\n\nI recommend creating purchase orders for these immediately.`;
    }

    if (ql.includes('top') || ql.includes('best') || ql.includes('selling')) {
      const salesItems = orders.filter(o => o.type === 'sales').flatMap(o => o.items);
      const agg = salesItems.reduce((acc, i) => { acc[i.productName] = (acc[i.productName] || 0) + i.quantity; return acc; }, {} as Record<string, number>);
      const sorted = Object.entries(agg).sort(([, a], [, b]) => b - a).slice(0, 5);
      if (sorted.length === 0) return "No sales data available yet.";
      return `📊 **Top selling products:**\n\n${sorted.map(([name, qty], i) => `${i + 1}. **${name}** — ${qty} units sold`).join('\n')}`;
    }

    if (ql.includes('value') || ql.includes('worth') || ql.includes('total')) {
      const total = products.reduce((s, p) => s + p.price * p.quantity, 0);
      const byCategory = products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + p.price * p.quantity; return acc; }, {} as Record<string, number>);
      return `💰 **Total inventory value: ${formatINR(total)}**\n\n${Object.entries(byCategory).map(([cat, val]) => `- ${cat}: ${formatINR(val)}`).join('\n')}`;
    }

    if (ql.includes('slow') || ql.includes('dead stock') || ql.includes('not selling')) {
      const salesIds = new Set(orders.filter(o => o.type === 'sales').flatMap(o => o.items.map(i => i.productId)));
      const slow = products.filter(p => !salesIds.has(p.id) && p.quantity > 0);
      if (slow.length === 0) return "All stocked products have sales activity!";
      return `🐌 **Slow-moving products (no sales recorded):**\n\n${slow.map(p => `- **${p.name}**: ${p.quantity} units in stock (value: ${formatINR(p.price * p.quantity)})`).join('\n')}\n\nConsider running promotions or reducing stock for these items.`;
    }

    if (ql.includes('summary') || ql.includes('overview') || ql.includes('status')) {
      const activeAlerts = alerts.filter(a => !a.dismissed).length;
      const pending = orders.filter(o => o.status === 'pending').length;
      return `📋 **Inventory Summary:**\n\n- **${products.length}** products in catalog\n- **${products.reduce((s, p) => s + p.quantity, 0).toLocaleString('en-IN')}** total units\n- **${pending}** pending orders\n- **${activeAlerts}** active alerts\n- Total value: **${formatINR(products.reduce((s, p) => s + p.price * p.quantity, 0))}**`;
    }

    if (ql.includes('supplier')) {
      const bySupplier = products.reduce((acc, p) => { if (!acc[p.supplier]) acc[p.supplier] = []; acc[p.supplier].push(p.name); return acc; }, {} as Record<string, string[]>);
      return `🏭 **Products by supplier:**\n\n${Object.entries(bySupplier).map(([sup, prods]) => `**${sup}:** ${prods.join(', ')}`).join('\n')}`;
    }

    return `I can help with:\n\n- 📦 **"Which products need restocking?"**\n- 🚨 **"What's out of stock?"**\n- 📊 **"Show top selling products"**\n- 💰 **"What's the total inventory value?"**\n- 🐌 **"Show slow-moving products"**\n- 📋 **"Give me an inventory summary"**\n- 🏭 **"List products by supplier"**\n\nTry one of these!`;
  };

  const send = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    const userMsg = { role: 'user' as const, content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: getResponse(msg) }]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center gap-2.5">
          <div className="icon-box bg-primary/10">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h1 className="page-title">AI Assistant</h1>
            <p className="page-subtitle">Ask questions about your inventory in natural language</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="flex-1 overflow-y-auto bg-card rounded-xl border p-5 space-y-4 mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ boxShadow: 'var(--shadow-card)' }}>
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              {m.role === 'assistant' && (
                <motion.div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5" whileHover={{ scale: 1.1, rotate: 10 }}>
                  <Bot className="h-4 w-4 text-primary" />
                </motion.div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted/70 rounded-bl-md'}`}>
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="bg-muted/70 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />

        {messages.length <= 1 && (
          <motion.div className="flex flex-wrap gap-2 pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            {quickActions.map((action, i) => (
              <motion.button
                key={action}
                onClick={() => send(action)}
                className="text-xs px-3.5 py-2 rounded-full border bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200 hover:shadow-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {action}
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>

      <motion.div className="flex gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Input placeholder="Ask about your inventory..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} className="flex-1 h-11 bg-card rounded-xl" />
        <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon" className="h-11 w-11 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <Send className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}
