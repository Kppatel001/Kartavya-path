'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Timer, Coffee, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { addFocusSession } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_TIME = 1500; // 25 minutes

export default function FocusPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(DEFAULT_TIME);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleSessionComplete = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const duration = Math.round((DEFAULT_TIME - seconds) / 60) || 25;
      await addFocusSession(user.uid, duration);
      toast({
        title: 'અભિનંદન!',
        description: 'તમારું ફોકસ સત્ર સફળતાપૂર્વક પૂર્ણ થયું અને સેવ થઈ ગયું છે.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'ભૂલ',
        description: 'સત્ર સેવ કરવામાં સમસ્યા આવી છે.',
      });
    } finally {
      setIsSaving(false);
      setSeconds(DEFAULT_TIME);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(DEFAULT_TIME);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-accent/10 text-accent mb-4">
          <ShieldCheck className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-headline text-white">ફોકસ મોડ (Distraction-Free)</h1>
        <p className="text-xl text-muted-foreground italic">
          "એકાગ્રતા એ સફળતાની ચાવી છે."
        </p>
      </div>

      <Card className="border-accent/20 bg-accent/5 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-5xl font-mono tracking-widest">{formatTime(seconds)}</CardTitle>
          <CardDescription className="text-lg">પ્રોમોડોરો ટાઈમર: ૨૫ મિનિટ એકાગ્રતા, ૫ મિનિટ વિરામ</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pb-8">
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={toggleTimer} className="w-32" disabled={isSaving}>
              {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isActive ? 'થોભો' : 'શરૂ કરો'}
            </Button>
            <Button variant="outline" size="lg" onClick={resetTimer} className="w-32" disabled={isSaving}>
              <RotateCcw className="mr-2 h-5 w-5" /> રીસેટ
            </Button>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-primary text-sm animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" /> સત્ર સેવ થઈ રહ્યું છે...
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" /> શા માટે ફોકસ મોડ?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            AI વિશ્લેષણ મુજબ, ટૂંકા અને સઘન અભ્યાસ સત્રો લાંબા સત્રો કરતા વધુ અસરકારક હોય છે. આ મોડમાં રહેવાથી તમારી યાદશક્તિમાં ૨૦% નો વધારો થઈ શકે છે.
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coffee className="h-4 w-4 text-orange-500" /> વિરામનું મહત્વ
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            દરેક ૨૫ મિનિટે ૫ મિનિટનો વિરામ લો. આ દરમિયાન થોડું પાણી પીવો અથવા આંખોને આરામ આપો. મગજ ફરીથી તાજગી અનુભવશે.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
