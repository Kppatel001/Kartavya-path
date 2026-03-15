'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPapersForUser } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BookOpen, 
  Target, 
  Zap, 
  BrainCircuit, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
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
import { Button } from '@/components/ui/button';

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

  const masteryData = [
    { subject: 'ગણિત', progress: 75, color: '#2979FF' },
    { subject: 'વિજ્ઞાન', progress: 62, color: '#7C4DFF' },
    { subject: 'સા. વિજ્ઞાન', progress: 88, color: '#00E676' },
    { subject: 'ગુજરાતી', progress: 95, color: '#FFAB00' },
  ];

  const weakTopics = [
    { topic: 'બીજગણિત (Quadratic Equations)', reason: 'ગણતરીમાં ભૂલો', subject: 'ગણિત' },
    { topic: 'પરકાશ (Reflection)', reason: 'આકૃતિ દોરવામાં મૂંઝવણ', subject: 'વિજ્ઞાન' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-white">
          નમસ્તે, {user?.displayName || 'વિદ્યાર્થી'} 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          તમારી પ્રગતિ અને 'વિદ્યા' ના સ્માર્ટ વિશ્લેષણ અહીં જોઈ શકાશે.
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
            <p className="text-xs text-muted-foreground mt-1">GSEB આધારિત પ્રશ્નપત્રો</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 border-accent/20 shadow-lg group hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">નિપુણતા (Mastery)</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">81%</div>
            <p className="text-xs text-muted-foreground mt-1">કુલ કોન્સેપ્ટ ક્લેરિટી</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20 shadow-lg group hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">સ્ટડી કલાકો</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.5h</div>
            <p className="text-xs text-muted-foreground mt-1">આ અઠવાડિયાનું ફોકસ</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20 shadow-lg group hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">કોગ્નિટીવ સ્કોર</CardTitle>
            <BrainCircuit className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">920</div>
            <p className="text-xs text-muted-foreground mt-1">તાર્કિક શક્તિ (વિશ્લેષણ)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 bg-card/40 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
              વિષયવાર માસ્ટરી લેવલ
            </CardTitle>
            <CardDescription>તમારા દ્વારા કરાયેલા રિવિઝન અને ટેસ્ટના આધારે</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryData} layout="vertical" margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="subject" 
                  type="category" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  width={80}
                />
                <ReTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={24}>
                  {masteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 bg-card/40 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-orange-400">
              <AlertCircle className="h-5 w-5" />
              નબળા ટોપિક્સ (Weak Topics)
            </CardTitle>
            <CardDescription>વિશ્લેષણ દ્વારા ઓળખવામાં આવેલ સુધારણાના વિસ્તારો</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weakTopics.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-white">{item.topic}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">{item.subject}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.reason}</p>
                <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-primary" asChild>
                  <Link href="/generate">આ ટોપિકની પ્રેક્ટિસ ટેસ્ટ લો <ChevronRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </div>
            ))}
            <div className="pt-2">
              <Button className="w-full bg-primary/20 text-primary hover:bg-primary/30" variant="secondary">
                <Activity className="mr-2 h-4 w-4" /> બધા નબળા ટોપિક્સ જુઓ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
