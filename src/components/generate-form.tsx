'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { educationBoards, classLevels, subjects, languages } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { generateBoardAlignedExamPaper } from '@/ai/flows/generate-board-aligned-exam-paper';
import { extractBlueprint } from '@/ai/flows/extract-blueprint';
import { addPaper } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Upload, FileText, X, Image as ImageIcon, GraduationCap } from 'lucide-react';
import type { ExamPaperSettings } from '@/types';

const formSchema = z.object({
  state: z.string().default('Gujarat'),
  board: z.string().min(1, 'બોર્ડ પસંદ કરો.'),
  classLevel: z.string().min(1, 'ધોરણ પસંદ કરો.'),
  subject: z.string().min(1, 'વિષય પસંદ કરો.'),
  chapters: z.string().min(1, 'પ્રકરણોના નામ લખો.'),
  totalMarks: z.coerce.number().min(10, 'કુલ ગુણ ઓછામાં ઓછા 10 હોવા જોઈએ.').max(100, 'કુલ ગુણ 100 થી વધુ ન હોઈ શકે.'),
  language: z.string().min(1, 'ભાષા પસંદ કરો.'),
  schoolName: z.string().optional(),
  timeAllowed: z.string().optional(),
  blueprintText: z.string().optional(),
});

export function GenerateForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [schoolLogoDataUri, setSchoolLogoDataUri] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: 'Gujarat',
      board: educationBoards[0],
      classLevel: '',
      subject: '',
      chapters: '',
      totalMarks: undefined,
      language: languages[0],
      schoolName: '',
      timeAllowed: '',
      blueprintText: '',
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsExtracting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUri = event.target?.result as string;
        try {
          const result = await extractBlueprint({ fileDataUri: dataUri });
          form.setValue('blueprintText', result.extractedBlueprint);
          toast({
            title: 'બ્લુપ્રિન્ટ નિષ્કર્ષિત',
            description: 'AI એ તમારા દસ્તાવેજનું સફળતાપૂર્વક વિશ્લેષણ કર્યું છે.',
          });
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'નિષ્કર્ષણ નિષ્ફળ',
            description: 'દસ્તાવેજમાંથી વિગતો મેળવી શકાઈ નથી.',
          });
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsExtracting(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        setSchoolLogoDataUri(event.target?.result as string);
        toast({ title: 'લોગો અપલોડ થયો', description: 'શાળાનો લોગો ઉમેરવામાં આવ્યો છે.' });
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'ભૂલ', description: 'પેપર બનાવવા માટે લોગિન કરવું જરૂરી છે.' });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateBoardAlignedExamPaper({
        ...values,
        state: 'Gujarat'
      });
      
      const paperSettings: ExamPaperSettings = {
        ...values,
        state: 'Gujarat',
        schoolLogo: schoolLogoDataUri || undefined,
      };
      const title = `${values.subject} - ધોરણ ${values.classLevel} (${values.board})`;

      const paperId = await addPaper(user.uid, title, paperSettings, result.examPaper);

      toast({ title: 'પેપર સફળતાપૂર્વક બન્યું!', description: 'નવું પેપર જોવા માટે રીડાયરેક્ટ થઈ રહ્યું છે.' });
      router.push(`/paper/${paperId}`);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'નિષ્ફળતા',
        description: error.message || 'પેપર બનાવવામાં ભૂલ આવી છે. ફરી પ્રયાસ કરો.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card className="border-border bg-card shadow-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              નવું પ્રશ્નપત્ર બનાવો
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>શાળાનું નામ</FormLabel>
                      <FormControl>
                        <Input placeholder="શાળા અથવા સંસ્થાનું નામ લખો" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                    <FormLabel>શાળાનો લોગો</FormLabel>
                    <div className="flex items-center gap-4">
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                        {schoolLogoDataUri ? (
                            <div className="relative h-10 w-10 border rounded overflow-hidden group">
                                <img src={schoolLogoDataUri} alt="Logo" className="h-full w-full object-contain" />
                                <button type="button" onClick={() => setSchoolLogoDataUri(null)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <X className="h-4 w-4 text-white" />
                                </button>
                            </div>
                        ) : (
                            <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} className="bg-background">
                                <ImageIcon className="mr-2 h-4 w-4" /> લોગો અપલોડ કરો
                            </Button>
                        )}
                    </div>
                </div>

                <FormField
                  control={form.control}
                  name="board"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>બોર્ડ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background"><SelectValue placeholder="બોર્ડ પસંદ કરો" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {educationBoards.map((board) => (
                            <SelectItem key={board} value={board}>{board}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ધોરણ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background"><SelectValue placeholder="ધોરણ પસંદ કરો" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classLevels.map((level) => (
                            <SelectItem key={level} value={level}>ધોરણ {level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>વિષય</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background"><SelectValue placeholder="વિષય પસંદ કરો" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>કુલ ગુણ</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="દા.ત., 80" {...field} value={field.value ?? ''} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeAllowed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>સમય મર્યાદા</FormLabel>
                      <FormControl>
                        <Input placeholder="દા.ત., 3 કલાક" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>પેપરની ભાષા</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background"><SelectValue placeholder="ભાષા પસંદ કરો" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-3">
                  <FormField
                    control={form.control}
                    name="chapters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>પ્રકરણો / ટોપિક્સ</FormLabel>
                        <FormControl>
                          <Input placeholder="દા.ત., બીજગણિત, ભૂમિતિ, આંકડાશાસ્ત્ર" {...field} className="bg-background" />
                        </FormControl>
                        <FormDescription className="text-muted-foreground">
                          અલ્પવિરામ (comma) થી પ્રકરણો અલગ કરો.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </div>

            <div className="border-t border-border pt-8">
                 <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">અભ્યાસક્રમ બ્લુપ્રિન્ટ (Blueprint)</h3>
                 </div>
                 <p className="text-sm text-muted-foreground mb-6">સત્તાવાર GSEB બ્લુપ્રિન્ટ અથવા સિલેબસ દસ્તાવેજ અપલોડ કરો. AI પેપરના માળખાનું વિશ્લેષણ કરશે.</p>

                 <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-10 bg-muted/20 transition-colors hover:bg-muted/30">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,image/*,.doc,.docx"
                        />
                        {isExtracting ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-sm font-medium">AI દસ્તાવેજનું વિશ્લેષણ કરી રહ્યું છે...</p>
                            </div>
                        ) : uploadedFile ? (
                            <div className="flex flex-col items-center gap-3">
                                <FileText className="h-12 w-12 text-primary" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold">{uploadedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setUploadedFile(null)} className="text-destructive">
                                    <X className="mr-2 h-4 w-4" /> દૂર કરો
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-12 w-12 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold">દસ્તાવેજ અપલોડ કરવા ક્લિક કરો</p>
                                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG અથવા Word</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-2 bg-background">ફાઈલ પસંદ કરો</Button>
                            </div>
                        )}
                    </div>

                    <FormField
                      control={form.control}
                      name="blueprintText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>બ્લુપ્રિન્ટ વિગતો (તમે અહીં સુધારો કરી શકો છો)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="વિભાગ મુજબ માળખું, ગુણભાર અથવા ખાસ સૂચનાઓ લખો..." 
                              className="min-h-[150px] bg-background"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full md:w-auto shadow-lg" disabled={isGenerating || isExtracting}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              AI દ્વારા પ્રશ્નપત્ર તૈયાર કરો
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
