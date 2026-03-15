'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { getPaper, updatePaperContent } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Languages, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  BrainCircuit, 
  Send,
  X,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Printer,
  Share2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { languages } from '@/lib/data';
import { translateExamPaper } from '@/ai/flows/translate-exam-papers';
import { socraticTutor } from '@/ai/flows/socratic-tutor-flow';
import { gujaratiTTS } from '@/ai/flows/gujarati-tts-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const LINES_PER_PAGE = 45;
const ANSWER_KEY_DELIMITER = "--- જવાબવહી / ઉત્તરવલી (Answer Key) ---";

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
  const [isTutoring, setIsTutoring] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const [targetLanguage, setTargetLanguage] = useState(languages[0]);
  
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Socratic Tutor State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const getVisibleContent = (rawContent: string, showKey: boolean) => {
    if (!rawContent.includes(ANSWER_KEY_DELIMITER)) return rawContent;
    if (showKey) return rawContent;
    return rawContent.split(ANSWER_KEY_DELIMITER)[0].trim();
  };

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
            const visible = getVisibleContent(fetchedPaper.content, showAnswerKey);
            paginateContent(visible);
          } else {
            toast({ variant: 'destructive', title: 'ભૂલ', description: 'પેપર મળ્યું નથી.' });
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

  useEffect(() => {
    if (content) {
      const visible = getVisibleContent(content, showAnswerKey);
      paginateContent(visible);
    }
  }, [showAnswerKey, content]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSave = () => {
    if (!id) return;
    startSavingTransition(async () => {
      await updatePaperContent(id, content);
      const visible = getVisibleContent(content, showAnswerKey);
      paginateContent(visible);
      setIsEditing(false);
      toast({ title: 'સફળતા', description: 'પ્રશ્નપત્ર સેવ થઈ ગયું છે.' });
    });
  };

  const handleTranslate = () => {
    if (!paper || isTranslating) return;
    startTranslationTransition(async () => {
      try {
        const result = await translateExamPaper({ examPaper: content, targetLanguage });
        const newContent = result.translatedExamPaper;
        setContent(newContent);
        const visible = getVisibleContent(newContent, showAnswerKey);
        paginateContent(visible);
        await updatePaperContent(id, newContent);
        toast({ title: 'અનુવાદ સફળ', description: `પેપરનું ${targetLanguage}માં અનુવાદ થઈ ગયું છે.` });
      } catch (error) {
        toast({ variant: 'destructive', title: 'ભૂલ', description: 'અનુવાદ નિષ્ફળ રહ્યો.' });
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSpeakConcept = async () => {
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = pages[currentPage - 1].slice(0, 500); 
    setIsSpeaking(true);
    try {
      const result = await gujaratiTTS({ text: textToSpeak });
      if (audioRef.current) {
        audioRef.current.src = result.audioDataUri;
        audioRef.current.play();
        audioRef.current.onended = () => setIsSpeaking(false);
      } else {
        const audio = new Audio(result.audioDataUri);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => setIsSpeaking(false);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'ભૂલ', description: 'અવાજ જનરેટ થઈ શક્યો નથી.' });
      setIsSpeaking(false);
    }
  };

  const handleTutorSubmit = async () => {
    if (!paper || !currentQuery.trim() || isTutoring) return;
    
    const userMsg = { role: 'user' as const, text: currentQuery };
    setChatMessages(prev => [...prev, userMsg]);
    setCurrentQuery('');
    setIsTutoring(true);

    try {
      const result = await socraticTutor({
        subject: paper.settings.subject,
        classLevel: paper.settings.classLevel,
        question: content.slice(0, 500), 
        studentQuery: userMsg.text,
        history: chatMessages
      });
      
      setChatMessages(prev => [...prev, { role: 'model', text: result.response }]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'ભૂલ', description: 'AI ટ્યુટર કનેક્ટ થઈ શક્યું નથી.' });
    } finally {
      setIsTutoring(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  if (!paper) return null;

  const PaperHeader = () => (
    <div className="mb-8 border-b-2 border-black pb-4 text-center">
        {paper.settings.schoolLogo && (
            <img src={paper.settings.schoolLogo} alt="Logo" className="mx-auto h-16 w-auto mb-2 object-contain" />
        )}
        <h2 className="text-2xl font-bold uppercase">{paper.settings.schoolName || 'પરીક્ષા પ્રશ્નપત્ર'}</h2>
        <h3 className="text-lg font-semibold">{paper.settings.subject} - ધોરણ {paper.settings.classLevel}</h3>
        <p className="text-sm italic">{paper.settings.board}</p>
        <div className="mt-4 flex justify-between text-sm font-bold border-t border-black pt-2">
            <div>સમય: {paper.settings.timeAllowed || '---'}</div>
            <div>કુલ ગુણ: {paper.settings.totalMarks}</div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4 text-left border-t border-dashed border-black/30 pt-2 font-mono text-xs">
            <div>નામ: _________________________________</div>
            <div>રોલ નં: __________________</div>
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div className="no-print">
        <Button variant="ghost" onClick={() => router.push('/history')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> પાછા જાઓ
        </Button>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline">{paper.title}</h1>
                <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary">GSEB બોર્ડ માળખું</Badge>
            </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 no-print">
        {isEditing ? (
          <>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              સેવ કરો
            </Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setContent(paper.content);
              const visible = getVisibleContent(paper.content, showAnswerKey);
              paginateContent(visible);
            }}>
              કેન્સલ
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              સુધારો કરો
            </Button>
            <Button variant="default" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              પ્રિન્ટ કરો
            </Button>
          </>
        )}

        <Button 
          variant={showAnswerKey ? "default" : "outline"} 
          onClick={() => setShowAnswerKey(!showAnswerKey)}
          disabled={isEditing || !content.includes(ANSWER_KEY_DELIMITER)}
        >
          {showAnswerKey ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {showAnswerKey ? "જવાબવહી સંતાડો" : "જવાબવહી જુઓ"}
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isEditing}><Languages className="mr-2 h-4 w-4" /> અનુવાદ</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>અનુવાદ કરો</DialogTitle>
              <DialogDescription>કઈ ભાષામાં અનુવાદ કરવા માંગો છો?</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="ભાષા પસંદ કરો" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={handleTranslate} disabled={isTranslating}>
                  {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  શરૂ કરો
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="secondary" onClick={handleSpeakConcept} disabled={isEditing}>
          {isSpeaking ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
          {isSpeaking ? "અવાજ બંધ કરો" : "વિદ્યા AI સમજાવશે"}
        </Button>

        <Button variant="secondary" onClick={() => setChatOpen(true)} className="ml-auto">
          <BrainCircuit className="mr-2 h-4 w-4" /> AI વિદ્યા ટ્યુટર
        </Button>
      </div>
      
      {isEditing ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[70vh] font-mono text-sm leading-relaxed p-6 no-print"
        />
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg p-10 bg-white shadow-xl min-h-[70vh] text-black overflow-hidden relative group print-content">
            {(currentPage === 1 || typeof window !== 'undefined') && <PaperHeader />}
            <pre className="whitespace-pre-wrap font-serif text-base leading-relaxed text-black">
              {pages[currentPage - 1] || 'કન્ટેન્ટ મળી શક્યું નથી.'}
            </pre>
            <div className="absolute bottom-4 right-8 text-xs text-black/50 italic no-print">
              પેજ {currentPage} / {pages.length}
            </div>
          </div>
          {pages.length > 1 && (
            <div className="flex justify-center items-center gap-4 no-print">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="mr-2 h-4 w-4" /> અગાઉનું
              </Button>
              <span className="text-sm font-medium">પેજ {currentPage} of {pages.length}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))} disabled={currentPage === pages.length}>
                આગળનું <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Socratic Tutor Floating Chat */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-card border-2 border-primary shadow-2xl rounded-2xl flex flex-col z-50 animate-in slide-in-from-bottom-4 no-print">
          <div className="p-4 border-b bg-primary text-primary-foreground flex justify-between items-center rounded-t-xl">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              <span className="font-bold">વિદ્યા AI ટ્યુટર</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="hover:bg-primary-foreground/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg text-sm leading-relaxed">
                નમસ્તે! હું **વિદ્યા AI** છું. આ પ્રશ્નપત્રમાં તમને ક્યાંય મુશ્કેલી છે? મને પૂછો, હું તમને વિચારવામાં મદદ કરીશ!
              </div>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTutoring && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-xl">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t flex gap-2">
            <Textarea
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder="તમારો પ્રશ્ન અહીં લખો..."
              className="min-h-[40px] max-h-[80px] text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTutorSubmit();
                }
              }}
            />
            <Button size="icon" onClick={handleTutorSubmit} disabled={isTutoring || !currentQuery.trim()} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
