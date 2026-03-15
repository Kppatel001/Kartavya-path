'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPapersForUser } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, Zap, BrainCircuit, BarChart3, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getPapersForUser(user.uid)
        .then(setPapers)
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Mocked progress data based on papers generated
  const masteryData = [
    { subject: 'ગણિત', progress: 75 },
    { subject: 'વિજ્ઞાન', progress: 60 },
    { subject: 'સામાજિક વિજ્ઞાન', progress: 85 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-white">
          નમસ્તે, {user?.displayName || 'વિદ્યાર્થી'} 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          તમારી શીખવાની પ્રક્રિયા અને કન્સેપ્ટ માસ્ટરીનો ચિતાર અહીં જોઈ શકાશે.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/10 border-primary/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">તૈયાર કરેલા પેપર્સ</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : papers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">કુલ જનરેટ કરેલા પ્રશ્નપત્રો</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 border-accent/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">સરેરાશ માસ્ટરી</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground mt-1">વિવિધ વિષયોમાં નિપુણતા</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">સ્ટડી કલાકો</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12h</div>
            <p className="text-xs text-muted-foreground mt-1">આ અઠવાડિયાનું ફોકસ ટાઇમ</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">કોગ્નિટીવ સ્કોર</CardTitle>
            <BrainCircuit className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">850</div>
            <p className="text-xs text-muted-foreground mt-1">તાર્કિક વિચારવાની ક્ષમતા</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
              વિષયવાર માસ્ટરી લેવલ
            </CardTitle>
            <CardDescription>GSEB પાઠ્યપુસ્તકોના આધારે પ્રગતિ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {masteryData.map((item) => (
              <div key={item.subject} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.subject}</span>
                  <span className="text-muted-foreground">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">તાજેતરની પ્રવૃત્તિ</CardTitle>
              <CardDescription>તમારા તાજેતરના પ્રશ્નપત્રો</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history">બધા જુઓ <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted/20 animate-pulse rounded" />)}
              </div>
            ) : papers.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <p className="text-sm">હજી સુધી કોઈ પ્રવૃત્તિ થઈ નથી.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {papers.slice(0, 5).map((paper) => (
                  <Link href={`/paper/${paper.id}`} key={paper.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                      {paper.settings.classLevel}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none truncate max-w-[200px]">{paper.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {paper.settings.subject} • ધોરણ {paper.settings.classLevel}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
