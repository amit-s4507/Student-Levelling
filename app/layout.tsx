import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/ui/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Student Levelling',
  description: 'Level up your learning journey',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icons/logo.svg',
        type: 'image/svg+xml',
      },
    ],
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
        <body className={inter.className}>
          <ThemeProvider>
            <Navigation />
            <main className="min-h-screen bg-background">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
