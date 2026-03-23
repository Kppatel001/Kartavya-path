
'use client';

import * as React from 'react';
import { useEffect, useState, useTransition, useRef } from 'react';
import { getPaper, updatePaperContent } from '@/lib/firebase/firestore';
import type { ExamPaper } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  FileText,
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
import { format } from 'date-fns';

const LINES_PER_PAGE = 45;
const ANSWER_KEY_DELIMITER = "--- જવાબવહી / ઉત્તરવલી (Answer Key) ---";

export default function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
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
  const [displayDate, setDisplayDate] = useState('--/--/----');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Socratic Tutor State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setDisplayDate(format(new Date(), 'dd/MM/yyyy'));
  }, []);

  const isOwner = user && paper && user.uid === paper.userId;

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
    if (id) {
      getPaper(id)
        .then((fetchedPaper) => {
          if (fetchedPaper) {
            setPaper(fetchedPaper);
            setContent(fetchedPaper.content);
            const visible = getVisibleContent(fetchedPaper.content, showAnswerKey);
            paginateContent(visible);
          } else {
            toast({ variant: 'destructive', title: 'ભૂલ', description: 'પ્રશ્નપત્ર મળી શક્યું નથી.' });
            router.push('/history');
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          router.push('/history');
        });
    }
  }, [id, router, toast, showAnswerKey]);

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
    if (!id || !isOwner) return;
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
        if (isOwner) {
            await updatePaperContent(id, newContent);
        }
        toast({ title: 'અનુવાદ સફળ', description: `પેપરનું ${targetLanguage}માં અનુવાદ થઈ ગયું છે.` });
      } catch (error) {
        toast({ variant: 'destructive', title: 'ભૂલ', description: 'અનુવાદ નિષ્ફળ રહ્યો.' });
      }
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: paper?.title || 'Exam Paper',
      text: `કર્તવ્ય પથ દ્વારા તૈયાર કરાયેલ પ્રશ્નપત્ર: ${paper?.title || 'પરીક્ષા પ્રશ્નપત્ર'}`,
      url: window.location.href,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch (error: any) {
      // Don't show error if user cancelled or browser denied permission silently
      if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
         // Fall through to clipboard
      }
    }

    // Fallback: Copy to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'લિંક કોપી થઈ ગઈ',
          description: 'શેર કરવા માટે લિંક તમારા ક્લિપબોર્ડમાં કોપી કરવામાં આવી છે.',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'ભૂલ',
        description: 'લિંક કોપી કરી શકાઈ નથી.',
      });
    }
  };

  const handleSpeakConcept = async () => {
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = pages[currentPage - 1]?.slice(0, 500) || ""; 
    if (!textToSpeak) return;

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
      toast({ variant: 'destructive', title: 'ભૂલ', description: 'ટ્યુટર કનેક્ટ થઈ શક્યું નથી.' });
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
    <div className="mb-6 border-b-2 border-black pb-4 text-center">
        <div className="flex justify-center items-center gap-4 mb-2">
            {paper.settings.schoolLogo && (
                <img src={paper.settings.schoolLogo} alt="Logo" className="h-14 w-auto object-contain" />
            )}
            <h2 className="text-2xl font-bold uppercase tracking-wide">{paper.settings.schoolName || 'પરીક્ષા પ્રશ્નપત્ર'}</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-sm font-bold border-t border-black pt-3">
            <div className="text-left">વિષય: {paper.settings.subject}</div>
            <div className="text-right">ધોરણ: {paper.settings.classLevel} ({paper.settings.board})</div>
            <div className="text-left">તારીખ: {displayDate}</div>
            <div className="text-right">કુલ ગુણ: {paper.settings.totalMarks}</div>
            <div className="text-left">સમય: {paper.settings.timeAllowed || '---'}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-left border-t border-dashed border-black/30 pt-3 font-mono text-xs">
            <div>વિદ્યાર્થીનું નામ: _________________________________</div>
            <div>રોલ નં: __________________</div>
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div className="no-print">
        <Button variant="ghost" onClick={() => router.push(user ? '/history' : '/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> પાછા જાઓ
        </Button>
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">{paper.title}</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">બોર્ડ: {paper.settings.board}</p>
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare} className="shrink-0 bg-primary/5 hover:bg-primary/10 border-primary/20">
              <Share2 className="mr-2 h-4 w-4 text-primary" /> શેર કરો
            </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 no-print bg-card/40 p-3 rounded-xl border border-border/50 backdrop-blur-sm sticky top-20 z-10">
        {isOwner && (
          <>
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  સેવ કરો
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>કેન્સલ</Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> સુધારો
              </Button>
            )}
            <div className="w-px h-8 bg-border/50 mx-1 hidden sm:block" />
          </>
        )}

        <Button 
          variant={showAnswerKey ? "default" : "outline"} 
          onClick={() => setShowAnswerKey(!showAnswerKey)}
          disabled={isEditing}
        >
          {showAnswerKey ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          જવાબવહી
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isEditing}><Languages className="mr-2 h-4 w-4" /> અનુવાદ</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>અનુવાદ કરો</DialogTitle>
              <DialogDescription>ભાષા પસંદ કરો</DialogDescription>
            </DialogHeader>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
              </SelectContent>
            </Select>
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={handleTranslate} disabled={isTranslating}>શરૂ કરો</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleSpeakConcept} disabled={isEditing}>
          {isSpeaking ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4 text-primary" />}
          સમજાવશે
        </Button>
      </div>
      
      {isOwner && isEditing ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[70vh] font-mono text-sm leading-relaxed p-6 no-print bg-background border-border shadow-inner"
        />
      ) : (
        <div className="space-y-4 no-print">
          <div className="border rounded-lg p-10 bg-white shadow-2xl min-h-[70vh] text-black overflow-hidden relative exam-paper-preview">
            {currentPage === 1 && <PaperHeader />}
            <pre className="whitespace-pre-wrap font-serif text-lg leading-loose text-black mt-4">
              {pages[currentPage - 1] || 'કન્ટેન્ટ મળી શક્યું નથી.'}
            </pre>
            <div className="absolute bottom-4 right-8 text-xs text-black/40 italic font-mono">
              - પેજ {currentPage} / {pages.length} -
            </div>
          </div>
          {pages.length > 1 && (
            <div className="flex justify-center items-center gap-4 py-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="mr-2 h-4 w-4" /> અગાઉનું
              </Button>
              <div className="text-sm font-medium">પેજ {currentPage} / {pages.length}</div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))} disabled={currentPage === pages.length}>
                આગળનું <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tutor Floating Chat - Only for owners or logged in students for now, but let's keep it for all if paper is loaded */}
      <Button 
        variant="secondary" 
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 shadow-2xl no-print bg-primary text-white hover:bg-primary/90"
      >
        <BrainCircuit className="mr-2 h-4 w-4" /> ટ્યુટરની મદદ લો
      </Button>

      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-card border-2 border-primary shadow-2xl rounded-2xl flex flex-col z-50 no-print">
          <div className="p-4 border-b bg-primary text-white flex justify-between items-center rounded-t-xl">
            <span className="font-bold">કર્તવ્ય પથ ટ્યુટર</span>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4 bg-muted/30">
            <div className="space-y-4 text-sm">
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-card border">
                  નમસ્તે! હું આ પ્રશ્નપત્ર સમજવામાં તમારી મદદ કરીશ. તમે કોઈ પણ પ્રશ્ન પૂછી શકો છો.
                </div>
              </div>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-card border'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t flex gap-2">
            <Input
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder="પ્રશ્ન પૂછો..."
              onKeyDown={(e) => e.key === 'Enter' && handleTutorSubmit()}
            />
            <Button size="icon" onClick={handleTutorSubmit} disabled={isTutoring} className="bg-primary hover:bg-primary/90">
              {isTutoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
