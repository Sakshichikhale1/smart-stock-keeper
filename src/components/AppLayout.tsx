import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Bell } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Badge } from '@/components/ui/badge';

export function AppLayout({ children }: { children: ReactNode }) {
  const { alerts } = useInventory();
  const activeAlerts = alerts.filter(a => !a.dismissed).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 shrink-0 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-3">
              {activeAlerts > 0 && (
                <div className="relative">
                  <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground text-[8px] flex items-center justify-center font-bold animate-pulse">
                    {activeAlerts}
                  </span>
                </div>
              )}
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[hsl(250,75%,60%)] flex items-center justify-center text-primary-foreground text-xs font-bold">
                A
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
