'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getPapersForUser, deletePaper } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, FileText, Calendar, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { gu } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdBanner } from '@/components/ad-banner';

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
  const [isPending, startTransition] = useTransition();

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

  const handleDelete = (paperId: string) => {
    startTransition(async () => {
      try {
        await deletePaper(paperId);
        setPapers((prev) => prev.filter((p) => p.id !== paperId));
        toast({
          title: 'સફળતા',
          description: 'પ્રશ્નપત્ર સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું છે.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'ભૂલ',
          description: 'પેપર ડિલીટ કરવામાં સમસ્યા આવી છે.',
        });
      }
    });
  };

  const formatDate = (paper: ExamPaper) => {
    if (!paper.createdAt) return 'હમણાં જ';
    try {
        const date = typeof paper.createdAt.toDate === 'function' ? paper.createdAt.toDate() : new Date(paper.createdAt as any);
        return format(date, 'PPP', { locale: gu });
    } catch (e) {
        return 'તારીખ ઉપલબ્ધ નથી';
    }
  };

  return (
    <div className="space-y-6 pb-20">
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
            <Card key={paper.id} className="border-border/50 hover:border-primary/50 transition-colors shadow-lg bg-card/40 backdrop-blur-sm relative group overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex-1 overflow-hidden">
                  <CardTitle className="truncate text-lg leading-tight">{paper.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> {formatDate(paper)}
                  </CardDescription>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0" title="ડિલીટ કરો">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>શું તમે આ પેપર કાઢી નાખવા માંગો છો?</AlertDialogTitle>
                      <AlertDialogDescription>
                        આ પેપર કાયમ માટે દૂર કરવામાં આવશે અને તમે તેને ફરીથી મેળવી શકશો નહીં.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>કેન્સલ</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(paper.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "ડિલીટ કરો"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-white/80">{paper.settings.subject}</p>
                  <p>ધોરણ {paper.settings.classLevel} • {paper.settings.totalMarks} ગુણ</p>
                  <p className="line-clamp-1 text-xs italic">પ્રકરણો: {paper.settings.chapters}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full group/btn">
                  <Link href={`/paper/${paper.id}`}>
                    <FileText className="mr-2 h-4 w-4 text-primary" /> 
                    પેપર જુઓ
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50 group-hover/btn:translate-x-1 transition-transform" />
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
      <AdBanner />
    </div>
  );
}
