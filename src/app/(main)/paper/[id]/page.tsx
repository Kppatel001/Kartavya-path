'use client';

import { useEffect, useState, useTransition } from 'react';
import { getPaper, updatePaperContent } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Printer, Save, Languages, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { languages } from '@/lib/data';
import { translateExamPaper } from '@/ai/flows/translate-exam-papers';
import { regenerateQuestion } from '@/ai/flows/regenerate-individual-questions';

export default function PaperPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, startSavingTransition] = useTransition();
  const [isTranslating, startTranslationTransition] = useTransition();
  const [isRegenerating, startRegeneratingTransition] = useTransition();

  const [targetLanguage, setTargetLanguage] = useState(languages[1]);

  const [questionToRegen, setQuestionToRegen] = useState("");
  const { id } = params;

  useEffect(() => {
    if (user) {
      getPaper(id)
        .then((fetchedPaper) => {
          if (fetchedPaper && fetchedPaper.userId === user.uid) {
            setPaper(fetchedPaper);
            setContent(fetchedPaper.content);
          } else {
            // Paper not found or doesn't belong to the user
            toast({ variant: 'destructive', title: 'Error', description: 'Paper not found or access denied.' });
            router.push('/history');
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          router.push('/history');
        });
    }
  }, [user, id, router, toast]);

  const handleSave = () => {
    startSavingTransition(async () => {
      await updatePaperContent(id, content);
      toast({ title: 'Success', description: 'Paper content saved successfully.' });
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTranslate = () => {
    if (!paper) return;
    startTranslationTransition(async () => {
      try {
        const result = await translateExamPaper({ examPaper: content, targetLanguage });
        setContent(result.translatedExamPaper);
        toast({ title: 'Translation Successful', description: `Paper translated to ${targetLanguage}.` });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Translation Failed', description: 'Could not translate the paper.' });
      }
    });
  };
  
  const handleRegenerate = () => {
    if(!paper) return;
    startRegeneratingTransition(async () => {
      try {
        const result = await regenerateQuestion({
            board: paper.settings.board,
            classLevel: paper.settings.classLevel,
            subject: paper.settings.subject,
            chapter: paper.settings.chapters.split(',')[0].trim(), // Use first chapter
            question: questionToRegen,
            marks: 5 // Default marks for now
        });
        const newContent = content + '\n\n--- Regenerated Question ---\n' + result.regeneratedQuestion;
        setContent(newContent);
        toast({ title: 'Question Regenerated', description: 'New question added to the end of the paper.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Regeneration Failed', description: 'Could not regenerate the question.' });
      }
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  if (!paper) {
    return null; // or a proper not found component
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable, #printable * { visibility: visible; }
          #printable { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none; }
        }
      `}</style>
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 no-print">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
        <h1 className="text-2xl font-bold tracking-tight font-headline">{paper.title}</h1>
        <p className="text-muted-foreground">
          Edit, translate, or print your generated exam paper.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 no-print">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline"><Languages className="mr-2 h-4 w-4" /> Translate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Translate Paper</DialogTitle>
              <DialogDescription>Select a language to translate the current paper content.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right">Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleTranslate} disabled={isTranslating}>
                {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Translate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
         <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Question</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerate Question</DialogTitle>
              <DialogDescription>Paste a question from your paper to regenerate it with AI.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea 
                placeholder="Paste the question to regenerate here..."
                value={questionToRegen}
                onChange={(e) => setQuestionToRegen(e.target.value)}
                rows={5}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleRegenerate} disabled={isRegenerating}>
                {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Regenerate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={handlePrint} variant="default">
          <Printer className="mr-2 h-4 w-4" />
          Print / Export PDF
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[70vh] font-mono text-sm leading-relaxed"
        placeholder="Your generated paper will appear here..."
      />

      <div id="printable" className="hidden print:block p-8">
        <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
      </div>
    </div>
  );
}
