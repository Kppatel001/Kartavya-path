'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { FilePlus2, History, Loader2, BookOpen, LayoutDashboard, BrainCircuit, ShieldCheck } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
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
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="bg-sidebar border-r border-border">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-4">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <span className="font-headline text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">ગુજરાત વિદ્યા AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ડેશબોર્ડ">
                  <Link href="/dashboard">
                    <LayoutDashboard className="text-primary" />
                    <span>ડેશબોર્ડ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="નવું પેપર બનાવો">
                  <Link href="/generate">
                    <FilePlus2 className="text-primary" />
                    <span>નવું પેપર બનાવો</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="પેપર ઇતિહાસ">
                  <Link href="/history">
                    <History className="text-primary" />
                    <span>પેપર ઇતિહાસ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ફોકસ મોડ">
                  <Link href="/focus">
                    <ShieldCheck className="text-accent" />
                    <span>ફોકસ મોડ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 bg-background text-foreground overflow-x-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b border-border bg-background/80 backdrop-blur-md px-6">
            <div className="mr-auto hidden md:block">
              <p className="text-sm font-medium text-muted-foreground">ગુજરાતના વિદ્યાર્થીઓ માટે પર્સનલાઈઝ્ડ AI ટ્યુટર</p>
            </div>
            <UserNav />
          </header>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
