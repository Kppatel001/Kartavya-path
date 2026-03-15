'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { FilePlus2, History, Loader2, BookOpen } from 'lucide-react';

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
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="bg-sidebar border-r border-border">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-headline text-xl font-bold tracking-tight">ગુજરાત વિદ્યા AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="નવું પેપર બનાવો">
                  <Link href="/generate">
                    <FilePlus2 className="text-primary" />
                    <span>નવું પેપર બનાવો</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ઇતિહાસ">
                  <Link href="/history">
                    <History className="text-primary" />
                    <span>પેપર ઇતિહાસ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 bg-background text-foreground">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b border-border bg-background/80 backdrop-blur-md px-6">
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
