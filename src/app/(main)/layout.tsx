
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { 
  FilePlus2, 
  History, 
  Loader2, 
  BookOpen, 
  LayoutDashboard, 
  BrainCircuit, 
  ShieldCheck,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

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
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">વિદ્યા AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ડેશબોર્ડ" className="h-11">
                  <Link href="/dashboard">
                    <LayoutDashboard className="text-primary h-5 w-5" />
                    <span className="font-medium">ડેશબોર્ડ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="નવું પેપર તૈયાર કરો" className="h-11">
                  <Link href="/generate">
                    <FilePlus2 className="text-primary h-5 w-5" />
                    <span className="font-medium">પેપર તૈયાર કરો</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="પેપર ઇતિહાસ" className="h-11">
                  <Link href="/history">
                    <History className="text-primary h-5 w-5" />
                    <span className="font-medium">પેપર ઇતિહાસ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <div className="h-px bg-border/50 my-4 mx-2" />
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ભૂલ ટ્રેકર" className="h-11">
                  <Link href="/dashboard">
                    <AlertCircle className="text-orange-500 h-5 w-5" />
                    <span className="font-medium">ભૂલ ટ્રેકર</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ફોકસ મોડ" className="h-11">
                  <Link href="/focus">
                    <ShieldCheck className="text-accent h-5 w-5" />
                    <span className="font-medium">ફોકસ મોડ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="સ્માર્ટ ટ્યુટર" className="h-11">
                  <Link href="/dashboard">
                    <GraduationCap className="text-green-500 h-5 w-5" />
                    <span className="font-medium">સ્માર્ટ ટ્યુટર</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 bg-background text-foreground overflow-x-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b border-border bg-background/80 backdrop-blur-md px-6 no-print">
            <div className="mr-auto hidden lg:flex items-center gap-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">STD 10</Badge>
              <p className="text-sm font-medium text-muted-foreground">ગુજરાત વિદ્યા AI - શુદ્ધ ગુજરાતી લર્નિંગ</p>
            </div>
            <div className="flex items-center gap-4">
              <UserNav />
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function Badge({ children, className, variant = "default" }: any) {
    const variants = {
        default: "bg-primary text-primary-foreground",
        outline: "border border-border"
    };
    return <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", variants[variant as keyof typeof variants], className)}>{children}</span>;
}
