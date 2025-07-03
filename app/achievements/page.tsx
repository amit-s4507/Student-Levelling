"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from '@/components/Confetti';

interface Achievement {
  type: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

export default function AchievementsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    const fetchAchievements = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/user/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch achievements');
        }
        const data = await response.json();
        setAchievements(data.achievements || []);
      } catch (err) {
        console.error('Failed to fetch achievements:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
    // Refresh achievements every 10 seconds
    const interval = setInterval(fetchAchievements, 10000);
    return () => clearInterval(interval);
  }, [user, isLoaded, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4 text-center">Loading achievements...</h1>
          <Progress value={100} className="w-full" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="mb-4">{error}</p>
        </Card>
      </div>
    );
  }

  const getProgress = (type: string) => {
    const achievement = achievements.find(a => a.type === type);
    return achievement ? (achievement.progress / achievement.maxProgress) * 100 : 0;
  };

  const getProgressText = (type: string) => {
    const achievement = achievements.find(a => a.type === type);
    if (!achievement) return '0/0';
    return `${achievement.progress}/${achievement.maxProgress}`;
  };

  const isCompleted = (type: string) => {
    return achievements.some(a => a.type === type && a.completed);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Achievements
      </motion.h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Math Achievement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
            <div className="flex items-center mb-4">
              <Image
                src="/icons/bronzemedal.svg"
                alt="Math Medal"
                width={40}
                height={40}
                className={isCompleted('Math Whiz') ? 'animate-bounce' : ''}
              />
              <h3 className="text-xl font-semibold ml-3">Math Whiz</h3>
            </div>
            <p className="text-muted-foreground mb-4">Get 3 perfect scores in math quizzes</p>
            <Progress value={getProgress('Math Whiz')} className="mb-2" />
            <p className="text-sm text-right text-muted-foreground">
              {isCompleted('Math Whiz') ? 'Completed!' : `${getProgressText('Math Whiz')} perfect scores`}
            </p>
          </Card>
        </motion.div>

        {/* Programming Achievement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
            <div className="flex items-center mb-4">
              <Image
                src="/icons/silvermedal.svg"
                alt="Programming Medal"
                width={40}
                height={40}
                className={isCompleted('Coding Master') ? 'animate-bounce' : ''}
              />
              <h3 className="text-xl font-semibold ml-3">Coding Master</h3>
            </div>
            <p className="text-muted-foreground mb-4">Complete 10 programming quizzes</p>
            <Progress value={getProgress('Coding Master')} className="mb-2" />
            <p className="text-sm text-right text-muted-foreground">
              {isCompleted('Coding Master') ? 'Completed!' : `${getProgressText('Coding Master')} quizzes`}
            </p>
          </Card>
        </motion.div>

        {/* Science Achievement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
            <div className="flex items-center mb-4">
              <Image
                src="/icons/goldmedal.svg"
                alt="Science Medal"
                width={40}
                height={40}
                className={isCompleted('Science Explorer') ? 'animate-bounce' : ''}
              />
              <h3 className="text-xl font-semibold ml-3">Science Explorer</h3>
            </div>
            <p className="text-muted-foreground mb-4">Complete 5 science quizzes</p>
            <Progress value={getProgress('Science Explorer')} className="mb-2" />
            <p className="text-sm text-right text-muted-foreground">
              {isCompleted('Science Explorer') ? 'Completed!' : `${getProgressText('Science Explorer')} quizzes`}
            </p>
          </Card>
        </motion.div>

        {/* Perfect Score Achievement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
            <div className="flex items-center mb-4">
              <Image
                src="/icons/goldmedal.svg"
                alt="Perfect Score Medal"
                width={40}
                height={40}
                className={isCompleted('Perfect Score') ? 'animate-bounce' : ''}
              />
              <h3 className="text-xl font-semibold ml-3">Perfect Score</h3>
            </div>
            <p className="text-muted-foreground mb-4">Get a perfect score in any quiz</p>
            <Progress value={getProgress('Perfect Score')} className="mb-2" />
            <p className="text-sm text-right text-muted-foreground">
              {isCompleted('Perfect Score') ? 'Completed!' : 'Not achieved yet'}
            </p>
          </Card>
        </motion.div>
      </div>

      {achievements.some(a => a.completed) && <Confetti />}
    </div>
  );
} 