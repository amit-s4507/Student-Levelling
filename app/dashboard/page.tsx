"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface UserStats {
  points: number;
  level: string;
  quizzes: number;
  achievements: {
    type: string;
    progress: number;
    maxProgress: number;
    completed: boolean;
  }[];
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  points: number;
  level: number;
  isCurrentUser: boolean;
}

const quickActions = [
  {
    title: 'Chat with AI',
    description: 'Get instant help with your questions',
    icon: '🤖',
    href: '/Chat',
    color: 'bg-blue-500',
  },
  {
    title: 'Generate Images',
    description: 'Create visual learning materials',
    icon: '🎨',
    href: '/Imagen',
    color: 'bg-purple-500',
  },
  {
    title: 'Join Study Group',
    description: 'Learn together with peers',
    icon: '👥',
    href: '/study-groups',
    color: 'bg-green-500',
  },
  {
    title: 'View Progress',
    description: 'Track your learning journey',
    icon: '📊',
    href: '/achievements',
    color: 'bg-yellow-500',
  },
];

export default function DashboardPage() {
  const { user } = useUser();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    points: 0,
    level: 'Beginner',
    quizzes: 0,
    achievements: []
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [courses, setCourses] = useState([
    {
      id: 'programming',
      title: 'Programming Fundamentals',
      description: 'Learn the basics of programming with interactive lessons',
      icon: '/icons/javascript.svg',
      progress: 0,
    },
    {
      id: 'math',
      title: 'Mathematics',
      description: 'Master mathematical concepts through gamified learning',
      icon: '/icons/math.svg',
      progress: 0,
    },
    {
      id: 'science',
      title: 'Science',
      description: 'Explore scientific concepts with interactive experiments',
      icon: '/icons/science.svg',
      progress: 0,
    },
  ]);

  useEffect(() => {
    setMounted(true);
    fetchUserStats();
    fetchLeaderboard();
  }, []);

  const fetchUserStats = async () => {
      try {
        const response = await fetch('/api/user/stats');
        const data = await response.json();
      setUserStats(data);
      
      // Update course progress from achievements
      setCourses(prevCourses => prevCourses.map(course => {
        const achievement = data.achievements?.find(
          (a: any) => a.type === `${course.id}_progress`
        );
        return {
          ...course,
          progress: achievement?.progress || 0
        };
      }));
      } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard.slice(0, 5)); // Show top 5 users
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 p-6 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background border"
      >
        <div className="flex-shrink-0">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20"
          >
              <Image
                src={user?.imageUrl || '/default-avatar.png'}
                alt="Profile"
              fill
              className="object-cover"
              />
          </motion.div>
              </div>
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold"
          >
            Welcome back, {user?.firstName || 'Student'}!
          </motion.h1>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-lg">🎯</span>
              <span>Points: {userStats.points}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">📚</span>
              <span>Level: {userStats.level}</span>
                  </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">✅</span>
              <span>Quizzes: {userStats.quizzes}</span>
            </div>
            </div>
          </div>
        </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          {/* Learning Progress */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">My Learning Progress</h2>
            <div className="grid gap-4">
              <AnimatePresence>
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/courses/${course.id}`}>
                      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 p-2">
                    <Image
                      src={course.icon}
                      alt={course.title}
                      width={32}
                      height={32}
                              className={theme === 'dark' ? 'invert' : ''}
                    />
                  </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-medium">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">
                      {course.description}
                    </p>
                            <Progress value={course.progress} className="h-2" />
                            <p className="text-xs text-right text-muted-foreground">
                              {course.progress}% Complete
                            </p>
                  </div>
                </div>
              </Card>
              </Link>
            </motion.div>
          ))}
              </AnimatePresence>
        </div>
          </section>

          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((action, index) => (
            <motion.div
                  key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
                  <Link href={action.href}>
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="flex flex-col h-full">
                        <div className="text-3xl mb-2">{action.icon}</div>
                        <h3 className="font-medium mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
          </section>
        </div>

        {/* Leaderboard Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Top Performers</h2>
            <Link href="/leaderboard">
              <span className="text-sm text-primary hover:underline">View All</span>
            </Link>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              {leaderboard.slice(0, 3).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.isCurrentUser ? 'bg-primary/10' : 'hover:bg-accent/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <p className="font-medium">
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs bg-primary/20 px-2 py-1 rounded-full">You</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-primary">{entry.points}</p>
                </motion.div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No leaderboard data available
                </p>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
} 