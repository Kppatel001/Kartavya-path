'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  educationBoards, 
  classLevels, 
  subjects, 
  languages, 
  districtsOfGujarat, 
  talukasByDistrict, 
  schoolsByDistrict 
} from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { generateBoardAlignedExamPaper, extractBlueprint } from '@/ai/server';
import { addPaper } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Upload, FileText, X, GraduationCap, MapPin, Plus, Trash2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ExamPaperSettings, BlueprintSection } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const sectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'વિભાગનું નામ લખો'),
  questionType: z.enum(['MCQ', 'VSA', 'SA', 'LA']),
  numQuestions: z.coerce.number().min(0),
  marksPerQuestion: z.coerce.number().min(0),
  difficulty: z.enum(['સામાન્ય', 'મધ્યમ', 'અઘરું']),
});

const formSchema = z.object({
  state: z.string().default('Gujarat'),
  district: z.string().optional(),
  taluka: z.string().optional(),
  board: z.string().min(1, 'બોર્ડ પસંદ કરવું ફરજિયાત છે.'),
  classLevel: z.string().min(1, 'ધોરણ પસંદ કરવું ફરજિયાત છે.'),
  subject: z.string().min(1, 'વિષય પસંદ કરવો ફરજિયાત છે.'),
  chapters: z.string().min(1, 'ઓછામાં ઓછા એક પ્રકરણનું નામ લખવું ફરજિયાત છે.'),
  totalMarks: z.coerce.number().min(1, 'કુલ ગુણ લખવા ફરજિયાત છે.').max(100, 'કુલ ગુણ 100 થી વધુ ન હોઈ શકે.'),
  language: z.string().min(1, 'ભાષા પસંદ કરવી ફરજિયાત છે.'),
  schoolName: z.string().optional(),
  timeAllowed: z.string().min(1, 'સમય મર્યાદા લખવી ફરજિયાત છે.'),
  examType: z.string().min(1, 'પરીક્ષાનો પ્રકાર પસંદ કરો'),
  blueprintText: z.string().optional(),
  structuredSections: z.array(sectionSchema).default([]),
});

export function GenerateForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isCustomSchoolMode, setIsCustomSchoolMode] = useState(false);
  const [useStructuredBlueprint, setUseStructuredBlueprint] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: 'Gujarat',
      district: '',
      taluka: '',
      board: '',
      classLevel: '',
      subject: '',
      chapters: '',
      totalMarks: undefined as any,
      language: '',
      schoolName: '',
      timeAllowed: '',
      examType: '',
      blueprintText: '',
      structuredSections: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "structuredSections"
  });

  const selectedDistrict = form.watch('district');
  const availableTalukas = selectedDistrict ? talukasByDistrict[selectedDistrict] || [] : [];
  const availableSchools = selectedDistrict ? schoolsByDistrict[selectedDistrict] || [] : [];
  
  const watchSections = form.watch('structuredSections') || [];
  const watchTotalMarks = form.watch('totalMarks');

  const calculatedTotal = watchSections.reduce((acc, section) => {
    const q = Number(section.numQuestions) || 0;
    const m = Number(section.marksPerQuestion) || 0;
    return acc + (q * m);
  }, 0);

  const isMarksMatching = calculatedTotal > 0 && calculatedTotal === Number(watchTotalMarks);

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
          setUseStructuredBlueprint(false);
          toast({ title: 'બ્લુપ્રિન્ટ નિષ્કર્ષિત', description: 'તમારા દસ્તાવેજનું સફળતાપૂર્વક વિશ્લેષણ કરવામાં આવ્યું છે.' });
        } catch (error) {
          toast({ variant: 'destructive', title: 'નિષ્કર્ષણ નિષ્ફળ', description: 'દસ્તાવેજમાંથી વિગતો મેળવી શકાઈ નથી.' });
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsExtracting(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'ભૂલ', description: 'પેપર બનાવવા માટે લોગિન કરવું જરૂરી છે.' });
      return;
    }

    setIsGenerating(true);
    try {
      const blueprintToUse = useStructuredBlueprint 
        ? (values.structuredSections.length > 0 ? `Structure: ${JSON.stringify(values.structuredSections)} Exam Type: ${values.examType}` : "")
        : (values.blueprintText || "");

      const response = await generateBoardAlignedExamPaper({
        ...values,
        state: 'Gujarat',
        district: values.district || "Gujarat",
        taluka: values.taluka || "",
        schoolName: values.schoolName || "",
        blueprintText: blueprintToUse,
      });
      
      if (!response.success) {
        throw new Error(response.error || "પેપર તૈયાર કરવામાં અજ્ઞાત ભૂલ આવી છે.");
      }

      const paperSettings: ExamPaperSettings = {
        state: values.state || "Gujarat",
        district: values.district || "",
        taluka: values.taluka || "",
        board: values.board || "",
        classLevel: values.classLevel || "",
        subject: values.subject || "",
        chapters: values.chapters || "",
        totalMarks: Number(values.totalMarks) || 0,
        language: values.language || "",
        schoolName: values.schoolName || "",
        timeAllowed: values.timeAllowed || "",
        examType: values.examType || "",
        blueprintText: blueprintToUse,
        structuredBlueprint: (useStructuredBlueprint && values.structuredSections.length > 0) ? values.structuredSections : [],
        schoolLogo: ""
      };

      const title = `${values.subject} - ${values.examType} - ધોરણ ${values.classLevel}`;

      const paperId = await addPaper(user.uid, title, paperSettings, response.examPaper!);

      toast({ title: 'પેપર સફળતાપૂર્વક બન્યું!', description: 'નવું પેપર જોવા માટે રીડાયરેક્ટ થઈ રહ્યું છે.' });
      router.push(`/paper/${paperId}`);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'નિષ્ફળતા', description: error.message || 'પેપર બનાવવામાં ભૂલ આવી છે. ફરી પ્રયાસ કરો.' });
    } finally {
      setIsGenerating(false);
    }
  }

  const onInvalid = (errors: any) => {
    toast({ variant: 'destructive', title: 'માહિતી અધૂરી છે', description: 'કૃપા કરીને લાલ રંગમાં દર્શાવેલ તમામ વિગતો યોગ્ય રીતે ભરો.' });
  };

  if (!mounted) return null;

  return (
    <Card className="border-border bg-card shadow-2xl overflow-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <GraduationCap className="h-7 w-7 text-primary" />
                નવું પ્રશ્નપત્ર તૈયાર કરો
              </CardTitle>
              <Badge variant="outline" className="bg-white/10 text-primary border-primary/20">GSEBAligned</Badge>
            </div>
            <CardDescription className="text-base">GSEB અભ્યાસક્રમ મુજબ સચોટ બ્લુપ્રિન્ટ સાથે પેપર બનાવો.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-10 p-6 sm:p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-primary/20 pb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">શાળા અને સ્થાનની વિગતો (વૈકલ્પિક)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>જિલ્લો (વૈકલ્પિક)</FormLabel>
                      <Select onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue('taluka', '');
                        form.setValue('schoolName', '');
                        setIsCustomSchoolMode(false);
                      }} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="જિલ્લો પસંદ કરો" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {districtsOfGujarat.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taluka"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>તાલુકો / શહેર (વૈકલ્પિક)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedDistrict}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="તાલુકો પસંદ કરો" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTalukas.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>શાળાનું નામ (વૈકલ્પિક)</FormLabel>
                      {isCustomSchoolMode ? (
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="શાળાનું નામ લખો" {...field} value={field.value || ''} autoFocus />
                          </FormControl>
                          <Button type="button" variant="outline" size="icon" onClick={() => setIsCustomSchoolMode(false)}><X className="h-4 w-4" /></Button>
                        </div>
                      ) : (
                        <Select 
                          onValueChange={(val) => val === 'ADD_NEW' ? setIsCustomSchoolMode(true) : field.onChange(val)} 
                          value={field.value || ''} 
                          disabled={!selectedDistrict}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="શાળા પસંદ કરો" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSchools.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                            <SelectItem value="ADD_NEW" className="font-bold text-primary">+ મારી શાળા ઉમેરો</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2 border-b-2 border-primary/20 pb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">પરીક્ષાનું માળખું</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="examType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>પરીક્ષાનો પ્રકાર</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="પરીક્ષાનો પ્રકાર પસંદ કરો" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="એકમ કસોટી">એકમ કસોટી (Unit Test)</SelectItem>
                          <SelectItem value="પ્રથમ સત્રાંત">પ્રથમ સત્રાંત પરીક્ષા</SelectItem>
                          <SelectItem value="વાર્ષિક પરીક્ષા">વાર્ષિક પરીક્ષા (Final Exam)</SelectItem>
                          <SelectItem value="પ્રી-બોર્ડ">પ્રી-બોર્ડ પરીક્ષા</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="board"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>બોર્ડ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="બોર્ડ પસંદ કરો" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {educationBoards.map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
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
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ધોરણ પસંદ કરો" />
                          </SelectTrigger>
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
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="વિષય પસંદ કરો" />
                          </SelectTrigger>
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
                        <Input 
                          type="number" 
                          {...field} 
                          value={field.value ?? ''} 
                          className="font-bold text-lg" 
                          placeholder="કુલ ગુણ લખો (દા.ત. ૨૫)" 
                        />
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
                        <Input 
                          placeholder="સમય મર્યાદા લખો (દા.ત. ૧ કલાક, ૨ કલાક)" 
                          {...field} 
                          value={field.value || ''} 
                        />
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
                      <FormLabel>માધ્યમ / ભાષા</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ભાષા પસંદ કરો" />
                          </SelectTrigger>
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
              </div>
              <FormField
                control={form.control}
                name="chapters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>પ્રકરણો / ટોપિક્સ (અલ્પવિરામ થી અલગ કરો)</FormLabel>
                    <FormControl>
                      <Input placeholder="દા.ત. બીજગણિત, સંભાવના, પાયથાગોરસનો પ્રમેય" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6 pt-4 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-primary/20 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">બ્લુપ્રિન્ટ બિલ્ડર (વૈકલ્પિક)</h3>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant={useStructuredBlueprint ? "default" : "outline"} size="sm" onClick={() => setUseStructuredBlueprint(true)}>માળખાગત</Button>
                  <Button type="button" variant={!useStructuredBlueprint ? "default" : "outline"} size="sm" onClick={() => setUseStructuredBlueprint(false)}>દસ્તાવેજ/મેન્યુઅલ</Button>
                </div>
              </div>

              {useStructuredBlueprint ? (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="relative group hover:border-primary/50 transition-colors">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                          <FormField
                            control={form.control}
                            name={`structuredSections.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">વિભાગ</FormLabel>
                                <FormControl><Input {...field} value={field.value || ''} placeholder="દા.ત. વિભાગ A" /></FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`structuredSections.${index}.questionType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">પ્રશ્ન પ્રકાર</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger><SelectValue placeholder="પ્રકાર પસંદ કરો" /></SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="MCQ">MCQ (વૈકલ્પિક)</SelectItem>
                                    <SelectItem value="VSA">VSA (એક વાક્ય)</SelectItem>
                                    <SelectItem value="SA">SA (ટૂંક જવાબી)</SelectItem>
                                    <SelectItem value="LA">LA (વિસ્તૃત)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`structuredSections.${index}.numQuestions`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">પ્રશ્નો</FormLabel>
                                <FormControl><Input type="number" {...field} value={field.value ?? ''} placeholder="સંખ્યા" /></FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`structuredSections.${index}.marksPerQuestion`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">ગુણ (દરેક)</FormLabel>
                                <FormControl><Input type="number" {...field} value={field.value ?? ''} placeholder="ગુણ" /></FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`structuredSections.${index}.difficulty`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">મુશ્કેલી</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger><SelectValue placeholder="કક્ષા" /></SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="સામાન્ય">સામાન્ય</SelectItem>
                                    <SelectItem value="મધ્યમ">મધ્યમ</SelectItem>
                                    <SelectItem value="અઘરું">અઘરું</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/30 p-4 rounded-xl border border-dashed">
                    <div className="space-y-1">
                      <Button type="button" variant="outline" onClick={() => append({ id: Math.random().toString(), name: `વિભાગ ${String.fromCharCode(65 + fields.length)}`, questionType: 'SA', numQuestions: 0 as any, marksPerQuestion: 0 as any, difficulty: 'સામાન્ય' })}>
                        <Plus className="mr-2 h-4 w-4" /> નવો વિભાગ ઉમેરો
                      </Button>
                      <p className="text-[10px] text-muted-foreground italic">(વૈકલ્પિક: તમે તેને ખાલી પણ છોડી શકો છો)</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-sm text-muted-foreground">ગણતરી મુજબ કુલ ગુણ:</p>
                          <div className="flex items-center gap-2 justify-end">
                             <span className={`text-2xl font-black ${isMarksMatching || fields.length === 0 ? 'text-green-500' : 'text-destructive'}`}>{Number.isNaN(calculatedTotal) ? 0 : calculatedTotal}</span>
                             <span className="text-muted-foreground">/ {watchTotalMarks || 0}</span>
                             {(isMarksMatching || fields.length === 0) ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-destructive" />}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,image/*,.doc,.docx" />
                    {isExtracting ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="font-bold">બ્લુપ્રિન્ટનું વિશ્લેષણ થઈ રહ્યું છે...</p>
                        </div>
                    ) : uploadedFile ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-primary/10 rounded-full"><FileText className="h-10 w-10 text-primary" /></div>
                            <div className="text-center"><p className="font-bold">{uploadedFile.name}</p></div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors"><Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary" /></div>
                            <div className="text-center">
                                <p className="font-bold">બ્લુપ્રિન્ટ ફાઈલ અપલોડ કરો</p>
                                <p className="text-sm text-muted-foreground">PDF અથવા ઈમેજ દ્વારા એઆઈ આપોઆપ માળખું શોધી લેશે</p>
                            </div>
                        </div>
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name="blueprintText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>માળખું / સૂચનાઓ (વૈકલ્પિક)</FormLabel>
                        <FormControl><Textarea placeholder="અહીં તમારા પેપરનું માળખું લખો..." className="min-h-[120px]" {...field} value={field.value || ''} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" /><span>જો કોઈ વિગત અધૂરી હશે, તો એઆઈ બોર્ડના ધોરણો મુજબ પેપર બનાવશે.</span>
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[200px] h-14 text-xl font-bold shadow-xl shadow-primary/20" disabled={isGenerating || isExtracting}>
              {isGenerating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Sparkles className="mr-3 h-6 w-6" />}પ્રશ્નપત્ર તૈયાર કરો
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
