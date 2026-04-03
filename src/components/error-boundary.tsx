'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6 bg-card/20 rounded-2xl border-2 border-dashed border-destructive/20">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">અરેરે! કંઈક ભૂલ થઈ છે.</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              સિસ્ટમમાં કોઈ અણધારી સમસ્યા આવી છે. કૃપા કરીને પેજ રીફ્રેશ કરો અથવા થોડી વાર પછી પ્રયાસ કરો.
            </p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> ફરીથી પ્રયાસ કરો
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 p-4 bg-black/50 text-xs text-left overflow-auto max-w-full rounded text-red-400">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
