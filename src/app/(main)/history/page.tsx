'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getPapersForUser } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

function PaperHistorySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">
          Paper History
        </h1>
        <p className="text-muted-foreground">
          View and manage your previously generated exam papers.
        </p>
      </div>

      {loading ? (
        <PaperHistorySkeleton />
      ) : papers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <Card key={paper.id}>
              <CardHeader>
                <CardTitle className="truncate">{paper.title}</CardTitle>
                <CardDescription>
                  Created on {paper.createdAt ? format(paper.createdAt.toDate(), 'PPP') : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {paper.settings.chapters}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/paper/${paper.id}`} passHref legacyBehavior>
                  <Button asChild>
                    <a><FileText className="mr-2 h-4 w-4" /> View Paper</a>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No papers generated yet</h2>
          <p className="text-muted-foreground mt-2">
            Start by creating your first exam paper.
          </p>
          <Link href="/generate" passHref legacyBehavior>
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate New Paper
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
