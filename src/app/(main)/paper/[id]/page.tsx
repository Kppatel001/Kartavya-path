
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
import { ArrowLeft, Loader2, Printer, Save, Languages, RefreshCw, Pencil, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
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

const LINES_PER_PAGE = 45;

export default function PaperPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, startSavingTransition] = useTransition();
  const [isTranslating, startTranslationTransition] = useTransition();
  const [isRegenerating, startRegeneratingTransition] = useTransition();
  const [copied, setCopied] = useState(false);

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
    if (!content) return;
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: 'Copied', description: 'Exam paper content copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
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
            chapter: paper.settings.chapters.split(',')[0].trim(),
            question: questionToRegen,
            marks: 5
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

  if (!paper) return null;

  const PaperHeader = ({ isPrint = false }) => (
    <div className={`mb-8 border-b-2 border-black pb-4 text-center ${isPrint ? 'block' : ''}`}>
        {paper.settings.schoolLogo && (
            <img src={paper.settings.schoolLogo} alt="Logo" className="mx-auto h-16 w-auto mb-2 object-contain" />
        )}
        <h2 className="text-2xl font-bold uppercase">{paper.settings.schoolName || 'EXAMINATION PAPER'}</h2>
        <h3 className="text-lg font-semibold">{paper.settings.subject} - Class {paper.settings.classLevel}</h3>
        <p className="text-sm italic">{paper.settings.board}</p>
        <div className="mt-4 flex justify-between text-sm font-bold border-t border-black pt-2">
            <div>TIME ALLOWED: {paper.settings.timeAllowed || '---'}</div>
            <div>TOTAL MARKS: {paper.settings.totalMarks}</div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4 text-left border-t border-dashed border-black/30 pt-2 font-mono text-xs">
            <div>Name: _________________________________</div>
            <div>Roll No: __________________</div>
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * { 
            visibility: hidden; 
            background: white !important;
          }
          .no-print, .no-print * { 
            display: none !important; 
          }
          #printable-area, #printable-area * { 
            visibility: visible; 
          }
          #printable-area { 
            display: block !important;
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            color: black !important;
          }
          .printable-page { 
            page-break-after: always; 
            width: 100%;
            margin-bottom: 20px;
          }
          pre {
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            font-family: 'PT Sans', serif !important;
            font-size: 11pt !important;
            line-height: 1.5 !important;
            color: black !important;
          }
        }
      `}</style>
      
      <div className="no-print">
        <Button variant="ghost" onClick={() => router.push('/history')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline">{paper.title}</h1>
                <p className="text-muted-foreground">Review and finalize your board-aligned paper.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Print / Export PDF
                </Button>
            </div>
        </div>
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
              setContent(paper.content);
              paginateContent(paper.content);
            }}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Content
          </Button>
        )}
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isEditing}><Languages className="mr-2 h-4 w-4" /> Translate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Translate Paper</DialogTitle>
              <DialogDescription>Select target language for translation.</DialogDescription>
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
                  Start Translation
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

         <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isEditing}><RefreshCw className="mr-2 h-4 w-4" /> Fix Question</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerate Question</DialogTitle>
              <DialogDescription>AI will rewrite the question while keeping the same marks and topic.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea 
                placeholder="Paste the question text here..."
                value={questionToRegen}
                onChange={(e) => setQuestionToRegen(e.target.value)}
                rows={5}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={handleRegenerate} disabled={isRegenerating || !questionToRegen}>
                  {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Regenerate
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isEditing ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[70vh] font-mono text-sm leading-relaxed p-6"
          placeholder="Edit your exam paper here..."
        />
      ) : (
        <div className="space-y-4 no-print">
          <div className="border rounded-lg p-10 bg-white shadow-xl min-h-[70vh] text-black overflow-hidden">
            <PaperHeader />
            <pre className="whitespace-pre-wrap font-serif text-base leading-relaxed text-black">
              {pages[currentPage - 1] || 'No content found.'}
            </pre>
          </div>
          {pages.length > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Prev
              </Button>
              <span className="text-sm font-medium">Page {currentPage} of {pages.length}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))} disabled={currentPage === pages.length}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Printable Area (Hidden on screen via Tailwind and visibility via CSS) */}
      <div id="printable-area" className="hidden print:block">
        {pages.map((pageContent, index) => (
          <div key={index} className="printable-page">
              {index === 0 && <PaperHeader isPrint />}
              <pre className="whitespace-pre-wrap">{pageContent}</pre>
              <div className="mt-8 text-center text-[10pt] italic border-t pt-2 border-gray-300">
                Generated by ExamSnap AI
              </div>
          </div>
        ))}
      </div>
    </div>
  );
}
