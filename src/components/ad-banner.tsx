'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// AdMob Configuration
const ADMOB_APP_ID = "ca-app-pub-1866650216428197~1065930653";
const DEFAULT_UNIT_ID = "ca-app-pub-1866650216428197/6592355970";

interface AdBannerProps {
  className?: string;
  unitId?: string;
  position?: 'top' | 'bottom' | 'inline';
}

export function AdBanner({ 
  className, 
  unitId = DEFAULT_UNIT_ID, 
  position = 'bottom' 
}: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // AdMob initialization simulation
    console.log(`Initializing AdMob with App ID: ${ADMOB_APP_ID}`);
    console.log(`Loading Banner Ad Unit: ${unitId} at ${position}`);
    
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, [unitId, position]);

  if (!isVisible) return null;

  const positionClasses = {
    bottom: "fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center translate-y-0",
    top: "sticky top-16 left-0 right-0 z-30 w-full flex justify-center mb-6",
    inline: "w-full flex justify-center my-6"
  };

  return (
    <div 
      className={cn(
        "transition-all duration-700 no-print",
        positionClasses[position],
        !isLoaded && position === 'bottom' ? "translate-y-full" : "translate-y-0",
        !isLoaded && position !== 'bottom' ? "opacity-0 scale-95" : "opacity-100 scale-100",
        className
      )}
      data-ad-unit={unitId}
    >
      <div className={cn(
        "relative w-full max-w-5xl bg-card border border-primary/10 shadow-xl backdrop-blur-md px-4 py-2 flex items-center justify-between overflow-hidden rounded-lg",
        position === 'bottom' && "rounded-b-none border-x-0 border-b-0"
      )}>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-1 right-2 bg-background/50 hover:bg-muted rounded-full p-0.5 z-10"
          title="બંધ કરો"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
        
        <div className="flex-1 flex items-center justify-center gap-4">
          <div className="hidden xs:block shrink-0">
            <span className="text-[9px] font-bold text-primary/40 uppercase tracking-tighter border border-primary/10 px-1 rounded">AD</span>
          </div>
          <div className="bg-muted/30 rounded overflow-hidden h-[50px] w-full max-w-[728px] flex items-center justify-center relative border border-white/5">
            <img 
              src={`https://picsum.photos/seed/${unitId.slice(-5)}/728/90`} 
              alt="Ad Banner" 
              className="object-cover w-full h-full opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
              data-ai-hint="advertisement banner"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <p className="text-white text-xs font-bold bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                કર્તવ્ય પથ - GSEB ની શ્રેષ્ઠ તૈયારી માટે
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
