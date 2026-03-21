'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { Loader2, GraduationCap, School } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { districtsOfGujarat, classLevels } from '@/lib/data';

const formSchema = z.object({
    name: z.string().min(2, { message: "નામ ઓછામાં ઓછું ૨ અક્ષરનું હોવું જોઈએ." }).optional(),
    email: z.string().email({ message: "કૃપા કરીને સાચું ઈમેલ એડ્રેસ લખો." }),
    password: z.string().min(6, { message: "પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ." }),
    role: z.enum(['teacher', 'student']).default('student'),
    standard: z.string().optional(),
    school: z.string().optional(),
    district: z.string().optional(),
    taluka: z.string().optional(),
});

export default function LoginPage() {
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      standard: "",
      school: "",
      district: "",
      taluka: "",
    },
  });

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
        if (isSignUp) {
            await signUpWithEmail(
              values.email, 
              values.password, 
              values.name || "",
              values.role,
              values.standard || "",
              values.school || "",
              values.district || "",
              values.taluka || ""
            );
            toast({ title: 'સફળતા', description: 'તમારું એકાઉન્ટ તૈયાર છે.' });
        } else {
            await signInWithEmail(values.email, values.password);
            toast({ title: 'સ્વાગત છે', description: 'તમે સફળતાપૂર્વક લોગિન કર્યું છે.' });
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: isSignUp ? 'સાઇન-અપ નિષ્ફળ' : 'લોગિન નિષ્ફળ',
            description: error.message || 'ઈમેલ અથવા પાસવર્ડ ખોટો છે.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || (user && !isSubmitting)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GraduationCap className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl text-white">કર્તવ્ય પથ</CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignUp ? 'નવું એકાઉન્ટ બનાવો' : 'તમારા એકાઉન્ટમાં લોગિન કરો'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isSignUp && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>પૂરું નામ</FormLabel>
                        <FormControl>
                          <Input placeholder="તમારું નામ" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>તમે કોણ છો?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="પસંદ કરો" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">વિદ્યાર્થી (Student)</SelectItem>
                            <SelectItem value="teacher">શિક્ષક (Teacher)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="standard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ધોરણ</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="ધોરણ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {classLevels.map(level => (
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
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>જિલ્લો</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="જિલ્લો" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {districtsOfGujarat.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
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
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>શાળાનું નામ</FormLabel>
                        <FormControl>
                          <Input placeholder="તમારી શાળા" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel>ઈમેલ</FormLabel>
                    <FormControl>
                      <Input autoComplete="email" placeholder="name@example.com" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel>પાસવર્ડ</FormLabel>
                    <FormControl>
                      <Input autoComplete={isSignUp ? 'new-password' : 'current-password'} type="password" placeholder="••••••••" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col space-y-2 pt-2">
                 <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSignUp ? 'એકાઉન્ટ બનાવો' : 'સાઇન ઇન'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? (
                <>
                    પહેલેથી એકાઉન્ટ છે?{' '}
                    <button type="button" className="text-primary hover:underline font-bold" onClick={() => setIsSignUp(false)}>લોગિન કરો</button>
                </>
            ) : (
                <>
                    એકાઉન્ટ નથી?{' '}
                    <button type="button" className="text-primary hover:underline font-bold" onClick={() => setIsSignUp(true)}>સાઇન અપ કરો</button>
                </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
