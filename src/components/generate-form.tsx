'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { indianStates, educationBoards, classLevels, subjects, languages } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { generateBoardAlignedExamPaper } from '@/ai/flows/generate-board-aligned-exam-paper';
import { addPaper } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import type { ExamPaperSettings } from '@/types';

const formSchema = z.object({
  state: z.string().min(1, 'State is required.'),
  board: z.string().min(1, 'Board is required.'),
  classLevel: z.string().min(1, 'Class is required.'),
  subject: z.string().min(1, 'Subject is required.'),
  chapters: z.string().min(1, 'Please specify at least one chapter.'),
  totalMarks: z.coerce.number().min(10, 'Total marks must be at least 10.').max(100, 'Total marks cannot exceed 100.'),
  language: z.string().min(1, 'Language is required.'),
  sectionAMcq: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().min(0, 'Must be a non-negative number.').optional()
  ),
  sectionAFillInTheBlanks: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().min(0, 'Must be a non-negative number.').optional()
  ),
  sectionAMatching: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().min(0, 'Must be a non-negative number.').optional()
  ),
  sectionATrueFalse: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().min(0, 'Must be a non-negative number.').optional()
  ),
  sectionAOneMark: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().min(0, 'Must be a non-negative number.').optional()
  ),
  sectionBQuestions: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().min(0, 'Must be a non-negative number.').optional()
  ),
  sectionCQuestions: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().min(0, 'Must be a non-negative number.').optional()
  ),
  sectionDQuestions: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().min(0, 'Must be a non-negative number.').optional()
  ),
});

export function GenerateForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

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
      sectionAMcq: undefined,
      sectionAFillInTheBlanks: undefined,
      sectionAMatching: undefined,
      sectionATrueFalse: undefined,
      sectionAOneMark: undefined,
      sectionBQuestions: undefined,
      sectionCQuestions: undefined,
      sectionDQuestions: undefined,
    },
  });

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
      // Remove undefined keys before sending to AI flow
      const submissionValues = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== undefined)
      );

      const result = await generateBoardAlignedExamPaper(submissionValues);
      
      const paperSettings: ExamPaperSettings = values;
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
            <CardTitle>Paper Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <div className="md:col-span-3">
              <FormField
                control={form.control}
                name="chapters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapters</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chapter 1, Chapter 2, Algebra" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter chapter names or topics, separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="md:col-span-3 border-t pt-6 mt-2">
                 <p className="text-lg font-semibold text-foreground mb-2">Blueprint / Section-wise Questions (Optional)</p>
                 <p className="text-sm text-muted-foreground mb-6">Define the number of questions for each section and type.</p>

                 <div className="space-y-8">
                    {/* Section A */}
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                        <h3 className="font-medium text-foreground">Section A</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <FormField
                                control={form.control}
                                name="sectionAMcq"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MCQs</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sectionAFillInTheBlanks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fill in Blanks</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sectionAMatching"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Matching</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sectionATrueFalse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>True/False</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sectionAOneMark"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>1-Mark Qs</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Other Sections */}
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                        <h3 className="font-medium text-foreground">Sections B, C, D</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="sectionBQuestions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section B Questions</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sectionCQuestions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section C Questions</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 8" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sectionDQuestions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section D Questions</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                 </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Paper
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
