'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPapersForUser } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, Zap, BrainCircuit, BarChart3 } from 'lucide-react';

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
          તમારું પ્રોગ્રેસ ડેશબોર્ડ
        </h1>
        <p className="text-muted-foreground">
          તમારી શીખવાની પ્રક્રિયા અને કન્સેપ્ટ માસ્ટરીનો ચિતાર.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">તૈયાર કરેલા પેપર્સ</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{papers.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">સરેરાશ માસ્ટરી</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">સ્ટડી કલાકો</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12h</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">કોગ્નિટીવ સ્કોર</CardTitle>
            <BrainCircuit className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">850</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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

        <Card>
          <CardHeader>
            <CardTitle>તાજેતરની પ્રવૃત્તિ</CardTitle>
          </CardHeader>
          <CardContent>
            {papers.length === 0 ? (
              <p className="text-sm text-muted-foreground">હજી સુધી કોઈ પ્રવૃત્તિ થઈ નથી.</p>
            ) : (
              <div className="space-y-4">
                {papers.slice(0, 5).map((paper) => (
                  <div key={paper.id} className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{paper.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {paper.settings.subject} • ધોરણ {paper.settings.classLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
