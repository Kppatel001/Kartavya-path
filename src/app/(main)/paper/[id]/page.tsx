'use client';

import { useEffect, useState, useTransition } from 'react';
import { getPaper, updatePaperContent } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Printer, Save, Languages, RefreshCw, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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

const LINES_PER_PAGE = 40;

export default function PaperPage() {
  const params = useParams();
  const id = params.id as string;
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
  
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const paginateContent = (text: string) => {
    const lines = text.split('\n');
    const newPages: string[] = [];
    if (lines.length > LINES_PER_PAGE) {
      const numPages = Math.ceil(lines.length / LINES_PER_PAGE);
      for (let i = 0; i < numPages; i++) {
        newPages.push(lines.slice(i * LINES_PER_PAGE, (i + 1) * LINES_PER_PAGE).join('\n'));
      }
    } else if (text) {
      newPages.push(text);
    }
    setPages(newPages);
    setCurrentPage(p => Math.max(1, Math.min(p, newPages.length || 1)));
  };

  useEffect(() => {
    if (user && id) {
      getPaper(id)
        .then((fetchedPaper) => {
          if (fetchedPaper && fetchedPaper.userId === user.uid) {
            setPaper(fetchedPaper);
            setContent(fetchedPaper.content);
            paginateContent(fetchedPaper.content);
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
    if (!id) return;
    startSavingTransition(async () => {
      await updatePaperContent(id, content);
      paginateContent(content);
      setIsEditing(false);
      toast({ title: 'Success', description: 'Paper content saved successfully.' });
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTranslate = () => {
    if (!paper || isTranslating) return;
    startTranslationTransition(async () => {
      try {
        const result = await translateExamPaper({ examPaper: content, targetLanguage });
        const newContent = result.translatedExamPaper;
        setContent(newContent);
        paginateContent(newContent);
        await updatePaperContent(id, newContent);
        toast({ title: 'Translation Successful', description: `Paper translated to ${targetLanguage} and saved.` });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Translation Failed', description: 'Could not translate the paper.' });
      }
    });
  };
  
  const handleRegenerate = () => {
    if(!paper || isRegenerating) return;
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
        paginateContent(newContent);
        await updatePaperContent(id, newContent);
        setQuestionToRegen("");
        toast({ title: 'Question Regenerated', description: 'New question added and paper saved.' });
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
          .no-print { display: none; }
          #printable, #printable * { visibility: visible; }
          #printable { position: absolute; left: 0; top: 0; width: 100%; }
          .printable-page { page-break-after: always; }
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
        {isEditing ? (
          <>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              // Revert content to original paper content if user cancels
              setContent(paper.content);
              paginateContent(paper.content);
            }}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Paper
          </Button>
        )}
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isEditing}><Languages className="mr-2 h-4 w-4" /> Translate</Button>
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
              <DialogClose asChild>
                <Button onClick={handleTranslate} disabled={isTranslating}>
                  {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Translate and Save
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
         <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isEditing}><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Question</Button>
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
              <DialogClose asChild>
                <Button onClick={handleRegenerate} disabled={isRegenerating || !questionToRegen}>
                  {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Regenerate and Save
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={handlePrint} variant="default" disabled={isEditing}>
          <Printer className="mr-2 h-4 w-4" />
          Print / Export PDF
        </Button>
      </div>
      
      {isEditing ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[70vh] font-mono text-sm leading-relaxed"
          placeholder="Your generated paper will appear here..."
        />
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg p-8 bg-card shadow-sm min-h-[70vh] font-sans text-sm leading-relaxed">
            <pre className="whitespace-pre-wrap font-inherit">
              {pages[currentPage - 1] || 'No content to display.'}
            </pre>
          </div>
          {pages.length > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4 no-print">
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {currentPage} of {pages.length}</span>
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))} disabled={currentPage === pages.length}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div id="printable" className="hidden">
        {pages.map((pageContent, index) => (
          <div key={index} className="printable-page p-12">
              <pre className="whitespace-pre-wrap font-sans text-sm">{pageContent}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
