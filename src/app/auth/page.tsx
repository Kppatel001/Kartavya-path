'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Loader2, Mail, Lock, User, School, MapPin, ChevronRight, BookOpen, UserCircle } from 'lucide-react';
import { districtsOfGujarat, classLevels, talukasByDistrict } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('સાચું ઈમેલ એડ્રેસ લખો.'),
  password: z.string().min(6, 'પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'નામ લખવું જરૂરી છે.'),
  email: z.string().email('સાચું ઈમેલ એડ્રેસ લખો.'),
  password: z.string().min(6, 'પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.'),
  role: z.enum(['teacher', 'student']),
  standard: z.string().min(1, 'ધોરણ પસંદ કરો.'),
  school: z.string().min(2, 'શાળાનું નામ લખો.'),
  district: z.string().min(1, 'જિલ્લો પસંદ કરો.'),
  taluka: z.string().min(1, 'તાલુકો પસંદ કરો.'),
});

export default function AuthPage() {
  const { user, signInWithEmail, signUpWithEmail, resetPassword, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
      standard: '',
      school: '',
      district: '',
      taluka: '',
    },
  });

  const selectedDistrict = signupForm.watch('district');
  const availableTalukas = selectedDistrict ? talukasByDistrict[selectedDistrict] || [] : [];

  async function onLogin(values: z.infer<typeof loginSchema>) {
    setIsPending(true);
    try {
      await signInWithEmail(values.email, values.password);
      toast({ title: 'સફળતા', description: 'લોગિન સફળ રહ્યું.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'ભૂલ', description: error.message });
    } finally {
      setIsPending(false);
    }
  }

  async function onSignup(values: z.infer<typeof signupSchema>) {
    setIsPending(true);
    try {
      await signUpWithEmail(
        values.email,
        values.password,
        values.name,
        values.role as any,
        values.standard,
        values.school,
        values.district,
        values.taluka
      );
      toast({ title: 'અભિનંદન', description: 'તમારું એકાઉન્ટ સફળતાપૂર્વક બની ગયું છે.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'ભૂલ', description: error.message });
    } finally {
      setIsPending(false);
    }
  }

  const handleForgotPassword = async () => {
    const email = loginForm.getValues('email');
    if (!email) {
      toast({ variant: 'destructive', title: 'ભૂલ', description: 'કૃપા કરીને ઈમેલ એડ્રેસ લખો.' });
      return;
    }
    try {
      await resetPassword(email);
      toast({ title: 'ઈમેલ મોકલવામાં આવ્યો', description: 'પાસવર્ડ રીસેટ કરવાની લિંક તમારા ઈમેલ પર મોકલવામાં આવી છે.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'ભૂલ', description: error.message });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-primary shadow-2xl shadow-primary/20 mb-2">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tight font-headline text-white">કર્તવ્ય પથ</h1>
            <p className="text-muted-foreground text-lg">GSEB ના ધોરણ મુજબ પ્રશ્નપત્ર અને પ્રગતિ ટ્રેકર</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 backdrop-blur-xl border border-white/10 p-1 h-14 rounded-2xl">
            <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-base font-bold">લોગિન</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-base font-bold">સાઇન-અપ</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="animate-in fade-in zoom-in-95 duration-300">
            <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl font-bold">સ્વાગત છે!</CardTitle>
                <CardDescription className="text-base">તમારા એકાઉન્ટમાં લોગિન કરો</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">ઈમેલ</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input placeholder="example@gmail.com" className="pl-12 h-12 bg-white/5 border-white/10 focus:border-primary focus:ring-primary rounded-xl" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">પાસવર્ડ</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input type="password" placeholder="••••••••" className="pl-12 h-12 bg-white/5 border-white/10 focus:border-primary focus:ring-primary rounded-xl" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-14 text-xl font-bold shadow-2xl shadow-primary/30 rounded-xl mt-4" disabled={isPending}>
                      {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ChevronRight className="mr-2 h-6 w-6" />}
                      લોગિન કરો
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6 pb-8">
                <Button variant="link" className="text-base text-primary/80 hover:text-primary" onClick={handleForgotPassword}>
                  પાસવર્ડ ભૂલી ગયા છો?
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  એકાઉન્ટ નથી? <button onClick={() => setActiveTab('signup')} className="text-primary font-black hover:underline ml-1">સાઇન-અપ કરો</button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="animate-in fade-in zoom-in-95 duration-300">
            <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
              <ScrollArea className="h-[60vh] w-full">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-3xl font-bold">નવું એકાઉન્ટ બનાવો</CardTitle>
                  <CardDescription className="text-base">GSEB શિક્ષકો અને વિદ્યાર્થીઓ માટે</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                          <UserCircle className="h-4 w-4" /> પાયાની વિગતો
                        </div>
                        <FormField
                          control={signupForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80">પૂર્ણ નામ</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                  <Input placeholder="તમારું નામ" className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80">ઈમેલ</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                  <Input placeholder="example@gmail.com" className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80">પાસવર્ડ</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                  <Input type="password" placeholder="••••••••" className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="bg-white/5" />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                          <BookOpen className="h-4 w-4" /> શૈક્ષણિક વિગતો
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={signupForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white/80">ભૂમિકા</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="પસંદ કરો" /></SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="student">વિદ્યાર્થી</SelectItem>
                                    <SelectItem value="teacher">શિક્ષક</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupForm.control}
                            name="standard"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white/80">ધોરણ</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="ધોરણ" /></SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {classLevels.map(l => <SelectItem key={l} value={l}>ધોરણ {l}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={signupForm.control}
                          name="school"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80">શાળાનું નામ</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <School className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                  <Input placeholder="શાળાનું નામ લખો" className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="bg-white/5" />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                          <MapPin className="h-4 w-4" /> રહેઠાણની વિગતો
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={signupForm.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white/80">જિલ્લો</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="જિલ્લો" /></SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {districtsOfGujarat.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupForm.control}
                            name="taluka"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white/80">તાલુકો</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDistrict}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="તાલુકો" /></SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availableTalukas.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-14 text-xl font-bold shadow-2xl shadow-primary/30 rounded-xl mt-6 mb-4" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "એકાઉન્ટ બનાવો"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </ScrollArea>
              <CardFooter className="border-t border-white/5 pt-6 pb-8">
                <p className="text-sm text-center w-full text-muted-foreground">
                  પહેલેથી એકાઉન્ટ છે? <button onClick={() => setActiveTab('login')} className="text-primary font-black hover:underline ml-1">લોગિન કરો</button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
