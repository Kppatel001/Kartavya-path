'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
    name: z.string().min(2, { message: "નામ ઓછામાં ઓછું ૨ અક્ષરનું હોવું જોઈએ." }).optional(),
    email: z.string().email({ message: "કૃપા કરીને સાચું ઈમેલ એડ્રેસ લખો." }),
    password: z.string().min(6, { message: "પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ." }),
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
            await signUpWithEmail(values.email, values.password, values.name);
            toast({ title: 'સફળતા', description: 'તમારું એકાઉન્ટ તૈયાર છે.' });
        } else {
            await signInWithEmail(values.email, values.password);
            toast({ title: 'સ્વાગત છે', description: 'તમે સફળતાપૂર્વક લોગિન કર્યું છે.' });
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'લોગિન નિષ્ફળ',
            description: error.message || 'ઈમેલ અથવા પાસવર્ડ ખોટો છે.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || (user && !isSubmitting)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Logo className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl">કર્તવ્ય પથ</CardTitle>
          <CardDescription>
            {isSignUp ? 'નવું એકાઉન્ટ બનાવો' : 'તમારા એકાઉન્ટમાં લોગિન કરો'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isSignUp && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>પૂરું નામ</FormLabel>
                      <FormControl>
                        <Input placeholder="તમારું નામ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel>ઈમેલ</FormLabel>
                    <FormControl>
                      <Input autoComplete="email" placeholder="name@example.com" {...field} />
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
                      <Input autoComplete={isSignUp ? 'new-password' : 'current-password'} type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col space-y-2 pt-2">
                 <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSignUp ? 'એકાઉન્ટ બનાવો' : 'સાઇન ઇન'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground mt-4">
            {isSignUp ? (
                <>
                    પહેલેથી એકાઉન્ટ છે?{' '}
                    <button type="button" className="text-primary hover:underline" onClick={() => setIsSignUp(false)}>લોગિન કરો</button>
                </>
            ) : (
                <>
                    એકાઉન્ટ નથી?{' '}
                    <button type="button" className="text-primary hover:underline" onClick={() => setIsSignUp(true)}>સાઇન અપ કરો</button>
                </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
