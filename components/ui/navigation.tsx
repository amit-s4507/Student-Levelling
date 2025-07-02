'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊'
  },
  {
    name: 'Learning Path',
    href: '/learning-path',
    icon: '🎯'
  },
  {
    name: 'Study Groups',
    href: '/study-groups',
    icon: '👥'
  },
  {
    name: 'Achievements',
    href: '/achievements',
    icon: '🏆'
  },
  {
    name: 'Leaderboard',
    href: '/Leaderboard',
    icon: '📈'
  }
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="dark:invert" />
          <span className="font-bold text-xl">Student Levelling</span>
        </Link>

        <nav className="ml-8 flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
              {pathname === item.href && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-[1.5px] left-0 right-0 h-[2px] bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.firstName || 'Student'}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 