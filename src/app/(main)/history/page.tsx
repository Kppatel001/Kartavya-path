'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getPapersForUser, deletePaper } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, FileText, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { gu } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

function PaperHistorySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="bg-card/50">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getPapersForUser(user.uid)
        .then((userPapers) => {
          setPapers(userPapers);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (paperId: string) => {
    if (!confirm('શું તમે આ પ્રશ્નપત્ર કાઢી નાખવા માંગો છો?')) return;

    try {
      await deletePaper(paperId);
      setPapers(papers.filter(p => p.id !== paperId));
      toast({
        title: 'સફળતા',
        description: 'પ્રશ્નપત્ર સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું છે.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'ભૂલ',
        description: 'પ્રશ્નપત્ર કાઢી નાખવામાં નિષ્ફળતા મળી.',
      });
    }
  };

  const formatDate = (paper: ExamPaper) => {
    if (!paper.createdAt) return 'હમણાં જ';
    try {
        return format(paper.createdAt.toDate(), 'PPP', { locale: gu });
    } catch (e) {
        return 'તારીખ ઉપલબ્ધ નથી';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-white">
          પ્રશ્નપત્ર ઇતિહાસ
        </h1>
        <p className="text-muted-foreground text-lg">
          તમારા દ્વારા અત્યાર સુધી તૈયાર કરવામાં આવેલા તમામ પ્રશ્નપત્રો અહીં જોઈ શકાશે.
        </p>
      </div>

      {loading ? (
        <PaperHistorySkeleton />
      ) : papers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <Card key={paper.id} className="border-border/50 hover:border-primary/50 transition-colors shadow-lg bg-card/40 backdrop-blur-sm relative group">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="truncate text-lg flex-1">{paper.title}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => handleDelete(paper.id)}
                    title="ડિલીટ કરો"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {formatDate(paper)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  વિષય: {paper.settings.subject} • ધોરણ {paper.settings.classLevel}
                  <br />
                  પ્રકરણો: {paper.settings.chapters}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/paper/${paper.id}`}>
                    <FileText className="mr-2 h-4 w-4" /> પેપર જુઓ
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-xl bg-card/20">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-semibold">હજી સુધી કોઈ પેપર જનરેટ થયા નથી</h2>
          <p className="text-muted-foreground mt-2">
            નવું પ્રશ્નપત્ર બનાવીને તમારી તૈયારી શરૂ કરો.
          </p>
          <Button asChild className="mt-6 shadow-xl" size="lg">
            <Link href="/generate">
              <PlusCircle className="mr-2 h-4 w-4" />
              નવું પેપર બનાવો
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
