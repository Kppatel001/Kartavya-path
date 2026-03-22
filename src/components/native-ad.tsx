'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const NATIVE_AD_UNIT_ID = "ca-app-pub-1866650216428197/2689337232";

interface NativeAdProps {
  className?: string;
}

export function NativeAd({ className }: NativeAdProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate AdMob Native Ad loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <Card className={cn("w-full bg-card/20 border-dashed animate-pulse min-h-[180px] flex items-center justify-center no-print", className)}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-40">જાહેરાત લોડ થઈ રહી છે...</p>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full overflow-hidden border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 shadow-xl transition-all hover:shadow-primary/10 no-print",
      className
    )}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6">
          <div className="relative shrink-0 w-full md:w-40 aspect-video md:aspect-square rounded-xl overflow-hidden shadow-inner bg-muted/50 group">
             <img 
               src={`https://picsum.photos/seed/${NATIVE_AD_UNIT_ID.slice(-5)}/400/400`} 
               alt="Native Ad Reference" 
               className="object-cover w-full h-full opacity-70 transition-transform duration-700 group-hover:scale-110"
               data-ai-hint="education student"
             />
             <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 rounded text-[8px] text-white font-black uppercase tracking-tighter border border-white/10">AD</div>
          </div>
          
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-black text-white leading-tight font-headline">GSEB ની તૈયારી હવે વધુ સરળ!</h4>
                <Info className="h-3.5 w-3.5 text-muted-foreground opacity-20 hover:opacity-100 cursor-help transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                કર્તવ્ય પથ સાથે જોડાઓ અને મેળવો નિષ્ણાત શિક્ષકો દ્વારા તૈયાર કરેલા પ્રશ્નપત્રો અને મટીરીયલ. તમારી મહેનતને આપો સાચી દિશા અને મેળવો શ્રેષ્ઠ પરિણામ.
              </p>
            </div>
            
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
               <div className="flex flex-col">
                  <span className="text-[9px] text-primary font-black uppercase tracking-widest">Sponsored</span>
                  <span className="text-xs font-bold text-muted-foreground/80">Kartavya Path Education</span>
               </div>
               <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold group">
                  વધુ જાણો <ExternalLink className="ml-2 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
               </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
