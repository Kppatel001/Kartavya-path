'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const APP_OPEN_AD_UNIT_ID = "ca-app-pub-1866650216428197/2176666497";

export function AppOpenAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Safe access to sessionStorage after mount
    try {
      const hasShown = sessionStorage.getItem('app_open_ad_shown');
      if (!hasShown) {
        setIsVisible(true);
        sessionStorage.setItem('app_open_ad_shown', 'true');
      }
    } catch (e) {
      console.error("Session storage access error:", e);
    }
  }, []);

  useEffect(() => {
    if (isVisible && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, countdown]);

  if (!mounted || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 no-print">
      <div className="absolute top-6 right-6">
        <Button 
          variant="ghost" 
          onClick={() => setIsVisible(false)} 
          disabled={countdown > 0}
          className="text-muted-foreground hover:bg-white/5"
        >
          {countdown > 0 ? (
            <span className="font-mono">{countdown} સેકન્ડ...</span>
          ) : (
            <span className="flex items-center gap-2">
              <X className="h-4 w-4" /> જાહેરાત બંધ કરો
            </span>
          )}
        </Button>
      </div>

      <div className="w-full max-w-md space-y-10 text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center p-6 rounded-[2.5rem] bg-primary shadow-2xl shadow-primary/20 animate-bounce">
            <GraduationCap className="h-20 w-20 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white font-headline">કર્તવ્ય પથ</h1>
            <p className="text-primary/80 font-medium text-lg italic">"સફળતાનો માર્ગ, તમારી મહેનત"</p>
          </div>
        </div>

        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-card/50 backdrop-blur-xl group">
          <img 
            src={`https://picsum.photos/seed/${APP_OPEN_AD_UNIT_ID.slice(-5)}/800/450`} 
            alt="App Open Ad" 
            className="object-cover w-full h-full opacity-60 transition-transform duration-700 group-hover:scale-105"
            data-ai-hint="education banner"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
             <div className="mt-auto text-center space-y-2">
                <p className="text-white text-xl font-bold drop-shadow-lg">GSEB ની શ્રેષ્ઠ તૈયારી માટે</p>
                <p className="text-white/60 text-sm">નવા પ્રશ્નપત્રો અને પ્રોગ્રેસ ટ્રેકર</p>
             </div>
          </div>
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 rounded-md text-[9px] text-white/80 uppercase font-black tracking-widest border border-white/10">
            AD • {APP_OPEN_AD_UNIT_ID}
          </div>
        </div>

        <div className="pt-4">
          <Button 
            size="lg"
            className="w-full h-16 text-2xl font-black rounded-2xl shadow-2xl shadow-primary/40 hover:scale-[1.02] transition-transform"
            onClick={() => setIsVisible(false)}
          >
            એપ્લિકેશન શરૂ કરો <ArrowRight className="ml-3 h-8 w-8" />
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">તમારી પ્રગતિ સુરક્ષિત રીતે સેવ થઈ રહી છે...</p>
        </div>
      </div>
    </div>
  );
}
