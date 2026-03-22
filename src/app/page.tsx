'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getPapersForUser, getMasteryForUser, getFocusSessionsForUser } from '@/lib/firebase/firestore';
import type { ExamPaper, StudentMastery, FocusSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BookOpen, 
  Target, 
  Zap, 
  BrainCircuit, 
  TrendingUp,
  Inbox,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import MainLayout from './(main)/layout';
import { AdBanner } from '@/components/ad-banner';
import { NativeAd } from '@/components/native-ad';

const SECOND_AD_UNIT_ID = "ca-app-pub-1866650216428197/5377544903";

export default function RootPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [mastery, setMastery] = useState<StudentMastery[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        getPapersForUser(user.uid),
        getMasteryForUser(user.uid),
        getFocusSessionsForUser(user.uid)
      ]).then(([userPapers, userMastery, userSessions]) => {
        setPapers(userPapers);
        setMastery(userMastery);
        setSessions(userSessions);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const totalFocusMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const averageMastery = mastery.length > 0 
    ? Math.round(mastery.reduce((acc, curr) => acc + curr.progress, 0) / mastery.length)
    : 0;

  const chartData = mastery.map((m, i) => ({
    subject: m.subject,
    progress: m.progress,
    color: ['#2979FF', '#7C4DFF', '#00E676', '#FFAB00', '#F44336'][ i % 5]
  }));

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <AdBanner unitId={SECOND_AD_UNIT_ID} position="top" />
        
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight font-headline text-white">
            નમસ્તે, {user?.displayName || 'વિદ્યાર્થી'} 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            તમારી પ્રગતિની વિગતો અહીં જોઈ શકાશે.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary/10 border-primary/20 shadow-lg group hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">તૈયાર પેપર્સ</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : papers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">તમારા દ્વારા તૈયાર કરાયેલા પેપર્સ</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/10 border-accent/20 shadow-lg group hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">નિપુણતા (Mastery)</CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : `${averageMastery}%`}</div>
              <p className="text-xs text-muted-foreground mt-1">કુલ કોન્સેપ્ટ ક્લેરિટી</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20 shadow-lg group hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">સ્ટડી કલાકો</CardTitle>
              <Zap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : `${(totalFocusMinutes / 60).toFixed(1)}h`}</div>
              <p className="text-xs text-muted-foreground mt-1">કુલ ફોકસ સમય</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/20 shadow-lg group hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">સત્રો</CardTitle>
              <BrainCircuit className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : sessions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">ફોકસ સત્રોની સંખ્યા</p>
            </CardContent>
          </Card>
        </div>

        <NativeAd className="my-8" />

        <div className="grid gap-6">
          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-headline">
                <TrendingUp className="h-5 w-5 text-primary" />
                વિષયવાર માસ્ટરી લેવલ
              </CardTitle>
              <CardDescription>તમારી પોતાની પ્રગતિનું વિશ્લેષણ</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] w-full pt-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="subject" 
                      type="category" 
                      tick={{ fill: '#94a3b8', fontSize: 14 }} 
                      width={100}
                    />
                    <ReTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    />
                    <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={32}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Inbox className="h-12 w-12 mb-4 opacity-20" />
                  <p>હજી સુધી કોઈ ડેટા ઉપલબ્ધ નથી.</p>
                  <p className="text-sm">પ્રશ્નપત્રો તૈયાર કરો અને પ્રેક્ટિસ શરૂ કરો!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AdBanner position="bottom" />
    </MainLayout>
  );
}
