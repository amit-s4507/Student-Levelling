"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface CourseProgress {
  id: string;
  title: string;
  description: string;
  progress: number;
  icon: string;
}

interface UserStats {
  points: number;
  level: string;
  totalQuizzes: number;
  courseProgress: Record<string, number>;
  achievements: Array<{
    type: string;
    progress: number;
    maxProgress: number;
    completed: boolean;
  }>;
  studyStreak: number;
  lastStudyDate: string | null;
}

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<UserStats>({
    points: 0,
    level: 'Beginner',
    totalQuizzes: 0,
    courseProgress: {},
    achievements: [],
    studyStreak: 0,
    lastStudyDate: null
  });
  const [courses, setCourses] = useState<CourseProgress[]>([
    {
      id: 'programming',
      title: 'Programming Fundamentals',
      description: 'Learn the basics of programming with interactive lessons',
      progress: 0,
      icon: '/icons/javascript.svg'
    },
    {
      id: 'math',
      title: 'Mathematics',
      description: 'Master mathematical concepts through gamified learning',
      progress: 0,
      icon: '/icons/math.svg'
    },
    {
      id: 'science',
      title: 'Science',
      description: 'Explore scientific concepts with interactive experiments',
      progress: 0,
      icon: '/icons/science.svg'
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats');
        const data = await response.json();
        setStats(data);
        
        // Update course progress using the courseProgress from API
        setCourses(prev => prev.map(course => ({
          ...course,
          progress: data.courseProgress[course.id] || 0
        })));
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    if (user) {
      fetchStats();
      // Poll for updates every 5 seconds
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const features = [
    {
      title: 'AI Chat Assistant',
      description: 'Get help with your studies',
      icon: '🤖',
      link: '/Chat',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Leaderboard',
      description: 'See where you rank',
      icon: '🏆',
      link: '/Leaderboard',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      title: 'Achievements',
      description: 'View your badges',
      icon: '🎯',
      link: '/achievements',
      color: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Image Generator',
      description: 'Create learning visuals',
      icon: '🎨',
      link: '/Imagen',
      color: 'from-blue-400 to-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* User Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-6 p-6 glass-effect rounded-2xl">
            <div className="relative">
              <Image
                src={user?.imageUrl || '/default-avatar.png'}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-400 p-2 rounded-full">
                <span className="text-xl">✨</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Welcome back, {user?.firstName || 'Student'}!
              </h1>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
                    <p className="font-bold">{stats.points}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
                    <p className="font-bold">{stats.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes</p>
                    <p className="font-bold">{stats.totalQuizzes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Course Progress */}
        <h2 className="text-2xl font-bold mb-6">My Learning Progress</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/courses/${course.id}`}>
                <Card className="p-6 hover-card transition-transform duration-200 hover:scale-105 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center">
                    <Image
                      src={course.icon}
                      alt={course.title}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {course.description}
                    </p>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-100 text-blue-600">
                            Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {course.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-blue-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={feature.link}>
                <Card className="p-6 hover-card cursor-pointer h-full">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 