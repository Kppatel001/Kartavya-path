'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { 
  FilePlus2, 
  History, 
  Loader2, 
  LayoutDashboard, 
  ShieldCheck,
  Menu,
  BrainCircuit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MainLayout({
  children,
}: {
  children: React.Node;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-white">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <Sidebar collapsible="icon" className="bg-sidebar border-r border-border shrink-0 no-print">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shrink-0">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden text-ellipsis text-white">કર્તવ્ય પથ</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ડેશબોર્ડ" className="h-11">
                  <a href="/dashboard">
                    <LayoutDashboard className="text-primary h-5 w-5" />
                    <span className="font-medium">ડેશબોર્ડ</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="નવું પેપર તૈયાર કરો" className="h-11">
                  <a href="/generate">
                    <FilePlus2 className="text-primary h-5 w-5" />
                    <span className="font-medium">પેપર તૈયાર કરો</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="મારા પેપર્સ" className="h-11">
                  <a href="/history">
                    <History className="text-primary h-5 w-5" />
                    <span className="font-medium">મારા પેપર્સ</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <div className="h-px bg-border/50 my-4 mx-2" />
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ફોકસ મોડ" className="h-11">
                  <a href="/focus">
                    <ShieldCheck className="text-accent h-5 w-5" />
                    <span className="font-medium">ફોકસ મોડ</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 bg-background text-foreground flex flex-col min-w-0">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6 no-print">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Menu className="h-6 w-6 text-primary" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("border-primary/20 bg-primary/5 text-primary hidden xs:inline-flex")}>GSEB STD 10</Badge>
                <p className="text-sm font-bold text-foreground truncate max-w-[150px] sm:max-w-none">કર્તવ્ય પથ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <UserNav />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
