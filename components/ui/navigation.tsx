'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/utils/useMediaBreakpoint';
import { ColorToggle } from '@/components/color-toggle';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', label: '📊 Dashboard', description: 'Your learning overview' },
  { href: '/learning-path', label: '🎯 Learning Path', description: 'Personalized course journey' },
  { href: '/study-groups', label: '👥 Study Groups', description: 'Collaborative learning' },
  { href: '/achievements', label: '🏆 Achievements', description: 'Your accomplishments' },
  { href: '/leaderboard', label: '🏅 Leaderboard', description: 'Top performers' },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, isSignedIn, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Student Levelling Logo" width={40} height={40} className="rounded-lg" />
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent gradient-animate">
                Student Levelling
              </h1>
              <p className="text-xs text-muted-foreground">Level Up Your Learning</p>
            </div>
        </Link>

          {isSignedIn && !isMobile && (
            <nav className="flex items-center gap-6">
              {navItems.map((item) => {
                return (
            <Link
              key={item.href}
              href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ColorToggle />
          
          {!isLoaded ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isSignedIn ? (
            <>
              {isMobile && (
                <Button
                  variant="ghost"
                  className="px-2"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span className="sr-only">Toggle menu</span>
                  {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12h16M4 6h16M4 18h16" />
                    </svg>
                  )}
                </Button>
              )}
              <UserButton 
                appearance={{
                  baseTheme: undefined,
                  elements: {
                    userButtonPopoverCard: "bg-popover border border-border shadow-lg",
                    userButtonPopoverActions: "text-foreground",
                    userButtonPopoverActionButton: "hover:bg-accent text-foreground",
                    userButtonPopoverActionButtonText: "text-foreground",
                    userButtonPopoverActionButtonIcon: "text-foreground",
                    userButtonTrigger: "focus:shadow-none"
                  }
                }}
                afterSignOutUrl="/"
              />
            </>
          ) : (
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-background"
          >
            <div className="container py-4">
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                        isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </Link>
                  );
                })}
              </nav>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 