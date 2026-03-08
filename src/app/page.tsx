'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { Icons } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
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
    if (user) {
      router.push('/generate');
    }
  }, [user, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
        if (isSignUp) {
            await signUpWithEmail(values.email, values.password, values.name);
        } else {
            await signInWithEmail(values.email, values.password);
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
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
          <CardTitle className="font-headline text-3xl">ExamSnap AI</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create an account to get started.' : 'Sign in to your account.'}
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
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                     <FormLabel>Email</FormLabel>
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
                     <FormLabel>Password</FormLabel>
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
                    {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground mt-4">
            {isSignUp ? (
                <>
                    Already have an account?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(false)}>Sign In</Button>
                </>
            ) : (
                <>
                    Don&apos;t have an account?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(true)}>Sign Up</Button>
                </>
            )}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={signInWithGoogle}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-3 h-6 w-6" />
            )}
            Sign in with Google
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
