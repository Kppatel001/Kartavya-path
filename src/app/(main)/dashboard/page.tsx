
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPapersForUser } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Target, 
  Zap, 
  BrainCircuit, 
  BarChart3, 
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
          તમારી પ્રગતિ અને 'વિદ્યા AI' ના સ્માર્ટ વિશ્લેષણ અહીં જોઈ શકાશે.
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
            <p className="text-xs text-muted-foreground mt-1">તાર્કિક શક્તિ (AI Metrics)</p>
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
            <CardDescription>AI દ્વારા ઓળખવામાં આવેલ સુધારણાના વિસ્તારો</CardDescription>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">તાજેતરની પ્રવૃત્તિ</CardTitle>
              <CardDescription>તમારા દ્વારા બનાવેલા પ્રશ્નપત્રો</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history" className="flex items-center">
                બધા જુઓ <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted/20 animate-pulse rounded" />)}
              </div>
            ) : papers.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <p className="text-sm italic">હજી સુધી કોઈ પ્રવૃત્તિ થઈ નથી. નવું પેપર બનાવીને શરૂઆત કરો!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {papers.slice(0, 4).map((paper) => (
                  <Link href={`/paper/${paper.id}`} key={paper.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                      {paper.settings.classLevel}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{paper.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {paper.settings.subject} • {paper.settings.totalMarks} ગુણ
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Zap className="h-32 w-32 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl">વિદ્યા AI સાથે રિવિઝન</CardTitle>
            <CardDescription>તમારી ભૂલોમાંથી શીખો અને યાદશક્તિ વધારો</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">ભૂલ ટ્રેકર (Mistake Tracker)</h4>
                <p className="text-xs text-muted-foreground">તમારા ૨૪ ખોટા પડેલા પ્રશ્નોનું AI વિશ્લેષણ તૈયાર છે.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button className="w-full bg-accent hover:bg-accent/90 shadow-lg">
                <Activity className="mr-2 h-4 w-4" /> રિવિઝન ક્વિઝ
              </Button>
              <Button variant="outline" className="w-full border-accent/20 hover:bg-accent/10">
                ભૂલો જુઓ
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground italic">
              "AI વિશ્લેષણ મુજબ, રિવિઝન ક્વિઝ લેવાથી યાદ રાખવાની ક્ષમતા ૩૫% વધે છે."
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
