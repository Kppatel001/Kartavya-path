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
});

export function GenerateForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: 'Maharashtra',
      board: 'CBSE',
      classLevel: '10',
      subject: 'Science',
      chapters: '',
      totalMarks: 70,
      language: 'English',
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
      const result = await generateBoardAlignedExamPaper(values);
      const paperSettings: ExamPaperSettings = values;
      const title = `${values.subject} - Class ${values.classLevel} (${values.board})`;

      const paperId = await addPaper(user.uid, title, paperSettings, result.examPaper);

      if (paperId) {
        toast({
          title: 'Paper Generated Successfully!',
          description: 'Redirecting to your new exam paper.',
        });
        router.push(`/paper/${paperId}`);
      } else {
        throw new Error('Failed to save the generated paper.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'An unexpected error occurred. Please try again.',
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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="md:col-span-2">
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
            <FormField
              control={form.control}
              name="totalMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Marks</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
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
