'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// AdMob Configuration from user
const ADMOB_APP_ID = "ca-app-pub-1866650216428197~1065930653";
const ADMOB_UNIT_ID = "ca-app-pub-1866650216428197/6592355970";

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate AdMob ad loading lifecycle using the provided IDs
    console.log(`Initializing AdMob with App ID: ${ADMOB_APP_ID}`);
    console.log(`Loading Banner Ad Unit: ${ADMOB_UNIT_ID}`);
    
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center transition-transform duration-500 no-print",
        isLoaded ? "translate-y-0" : "translate-y-full",
        className
      )}
      data-ad-unit={ADMOB_UNIT_ID}
    >
      <div className="relative w-full max-w-4xl bg-card border-t border-primary/20 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md px-4 py-2 flex items-center justify-between">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute -top-3 right-4 bg-background border border-border rounded-full p-1 shadow-md hover:bg-muted transition-colors"
          title="જાહેરાત બંધ કરો"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
        
        <div className="flex-1 flex items-center justify-center gap-4">
          <div className="hidden sm:block">
            <span className="text-[10px] font-bold text-primary/50 uppercase tracking-tighter border border-primary/20 px-1 rounded">AD</span>
          </div>
          <div className="bg-muted/50 rounded overflow-hidden h-[50px] w-full max-w-[728px] flex items-center justify-center relative">
            <img 
              src="https://picsum.photos/seed/ad123/728/90" 
              alt="Ad Banner" 
              className="object-cover w-full h-full opacity-80"
              data-ai-hint="advertisement banner"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <p className="text-white text-xs font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                કર્તવ્ય પથ - GSEB ની શ્રેષ્ઠ તૈયારી માટે
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
