
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
import { indianStates, educationBoards, classLevels, subjects, languages } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { generateBoardAlignedExamPaper } from '@/ai/flows/generate-board-aligned-exam-paper';
import { extractBlueprint } from '@/ai/flows/extract-blueprint';
import { addPaper } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Upload, FileText, X, Image as ImageIcon } from 'lucide-react';
import type { ExamPaperSettings } from '@/types';

const formSchema = z.object({
  state: z.string().min(1, 'State is required.'),
  board: z.string().min(1, 'Board is required.'),
  classLevel: z.string().min(1, 'Class is required.'),
  subject: z.string().min(1, 'Subject is required.'),
  chapters: z.string().min(1, 'Please specify at least one chapter.'),
  totalMarks: z.coerce.number().min(10, 'Total marks must be at least 10.').max(100, 'Total marks cannot exceed 100.'),
  language: z.string().min(1, 'Language is required.'),
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
      state: '',
      board: '',
      classLevel: '',
      subject: '',
      chapters: '',
      totalMarks: undefined,
      language: '',
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
            title: 'Blueprint Extracted',
            description: 'AI has successfully analyzed your uploaded document.',
          });
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Extraction Failed',
            description: 'Could not extract details from the document.',
          });
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading failed', error);
      setIsExtracting(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        setSchoolLogoDataUri(event.target?.result as string);
        toast({ title: 'Logo Uploaded', description: 'School logo has been added to your settings.' });
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    form.setValue('blueprintText', '');
  };

  const clearLogo = () => {
    setSchoolLogoDataUri(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to generate a paper.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateBoardAlignedExamPaper(values);
      
      const paperSettings: ExamPaperSettings = {
        ...values,
        schoolLogo: schoolLogoDataUri || undefined,
      };
      const title = `${values.subject} - Class ${values.classLevel} (${values.board})`;

      const paperId = await addPaper(user.uid, title, paperSettings, result.examPaper);

      toast({
        title: 'Paper Generated Successfully!',
        description: 'Redirecting to your new exam paper.',
      });
      router.push(`/paper/${paperId}`);

    } catch (error: any) {
      console.error("Generation submission failed", error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Paper Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter school or institution name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <FormLabel>School Logo</FormLabel>
                        <div className="mt-2 flex items-center gap-4">
                            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                            {schoolLogoDataUri ? (
                                <div className="relative h-10 w-10 border rounded overflow-hidden group">
                                    <img src={schoolLogoDataUri} alt="Logo" className="h-full w-full object-contain" />
                                    <button onClick={clearLogo} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <X className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                                    <ImageIcon className="mr-2 h-4 w-4" /> Upload Logo
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
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
                      <FormLabel>Board</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a board" /></SelectTrigger>
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
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classLevels.map((level) => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
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
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
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
                      <FormLabel>Total Marks</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 80" {...field} value={field.value ?? ''} />
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
                      <FormLabel>Time Allowed</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3 Hours" {...field} />
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
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger>
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
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="chapters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapters / Topics</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Algebra, Geometry, Statistics" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate multiple chapters with commas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </div>

            {/* Blueprint Section */}
            <div className="border-t pt-8">
                 <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Exam Blueprint</h3>
                 </div>
                 <p className="text-sm text-muted-foreground mb-6">Upload a syllabus or blueprint document. AI will extract the structure for you.</p>

                 <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 bg-muted/30 transition-colors hover:bg-muted/50">
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
                                <p className="text-sm font-medium">Analyzing document with AI...</p>
                            </div>
                        ) : uploadedFile ? (
                            <div className="flex flex-col items-center gap-3">
                                <FileText className="h-12 w-12 text-primary" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold">{uploadedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={clearFile} className="text-destructive">
                                    <X className="mr-2 h-4 w-4" /> Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-12 w-12 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold">Click to upload document</p>
                                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG, or Word</p>
                                </div>
                                <Button type="button" variant="outline" size="sm">Select File</Button>
                            </div>
                        )}
                    </div>

                    <FormField
                      control={form.control}
                      name="blueprintText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extracted Details (Editable)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe section breakdown, mark distribution, or specific instructions..." 
                              className="min-h-[150px]"
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
            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isGenerating || isExtracting}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Professional Exam Paper
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
