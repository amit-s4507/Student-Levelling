import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/ui/navigation';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Student Levelling - Level Up Your Learning',
  description: 'An interactive learning platform that helps students track their progress and level up their skills.',
  icons: {
    icon: '/logo.png',
  },
  keywords: ['education', 'e-learning', 'personalized learning', 'AI education', 'student progress tracking'],
  authors: [{ name: 'Amit Sahu' }],
  openGraph: {
    title: 'Student Levelling - Personalized Learning Platform',
    description: 'Master concepts through AI-powered personalized learning paths',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icons/logo.svg" type="image/svg+xml" />
          {/* Add preload for critical icons */}
          <link rel="preload" href="/icons/bronzemedal.svg" as="image" type="image/svg+xml" />
          <link rel="preload" href="/icons/silvermedal.svg" as="image" type="image/svg+xml" />
          <link rel="preload" href="/icons/goldmedal.svg" as="image" type="image/svg+xml" />
        </head>
        <body className={`${inter.className} min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300`}>
          <ThemeProvider>
            <Navigation />
            <main className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>
            <Toaster position="bottom-right" />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
