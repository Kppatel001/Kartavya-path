import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AppOpenAd } from '@/components/app-open-ad';

export const metadata: Metadata = {
  title: 'કર્તવ્ય પથ',
  description: 'GSEB ના ધોરણ મુજબ સેકન્ડોમાં પ્રશ્નપત્ર તૈયાર કરો.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: Readonly<React.ReactNode>;
}>) {
  return (
    <html lang="gu" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background')}>
        <Providers>
          <AppOpenAd />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
