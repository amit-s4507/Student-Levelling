import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from '@/components/ui/navigation';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Levelling",
  description: "A gamified learning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <ThemeProvider>
            <Navigation />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
