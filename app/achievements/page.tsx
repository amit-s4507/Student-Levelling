"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Achievement {
  type: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

export default function AchievementsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/user/stats');
        if (!response.ok) throw new Error('Failed to fetch achievements');
        const data = await response.json();
        setAchievements(data.achievements || []);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchAchievements, 5000);
    return () => clearInterval(interval);
  }, [user, isLoaded, router]);

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'Math Whiz':
        return '/icons/math.svg';
      case 'Coding Master':
        return '/icons/programming.svg';
      case 'Science Explorer':
        return '/icons/science.svg';
      case 'Perfect Score':
        return '/icons/goldmedal.svg';
      default:
        return '/icons/bronzemedal.svg';
    }
  };

  const getAchievementDescription = (type: string) => {
    switch (type) {
      case 'Math Whiz':
        return 'Get 3 perfect scores in math quizzes';
      case 'Coding Master':
        return 'Complete 10 programming quizzes';
      case 'Science Explorer':
        return 'Complete 5 science quizzes';
      case 'Perfect Score':
        return 'Get all answers correct in any quiz';
      default:
        return 'Complete the achievement requirements';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 dark:from-background dark:via-background dark:to-primary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-14 bg-primary/10 rounded-xl w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-52 bg-card/50 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 dark:from-background dark:via-background dark:to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent gradient-animate"
        >
          Your Achievements
        </motion.h1>

        {achievements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8 text-center glass shadow-xl rounded-2xl border-primary/20">
              <h3 className="text-2xl font-semibold mb-4">Start Your Journey</h3>
              <p className="text-muted-foreground">
                Complete quizzes to unlock achievements and track your progress!
              </p>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: index * 0.1 
                  }}
                >
                  <Card 
                    className={`p-6 transform transition-all duration-300 hover:scale-[1.02] ${
                      achievement.completed 
                        ? 'glass border-primary/30 shadow-lg shadow-primary/20' 
                        : 'bg-card/50 backdrop-blur-sm hover:bg-card/80 border-border/50'
                    } rounded-2xl`}
                  >
                    <div className="flex items-start space-x-4">
                      <motion.div 
                        className="relative w-14 h-14"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Image
                          src={getAchievementIcon(achievement.type)}
                          alt={achievement.type}
                          width={56}
                          height={56}
                          className={`drop-shadow-xl transition-opacity duration-300 ${
                            achievement.completed ? 'opacity-100' : 'opacity-50'
                          }`}
                        />
                        {achievement.completed && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
                          >
                            <span className="text-primary-foreground text-sm">✓</span>
                          </motion.div>
                        )}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {achievement.type}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {getAchievementDescription(achievement.type)}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {achievement.progress} / {achievement.maxProgress}
                            </span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100}
                            className="h-2.5 rounded-full bg-primary/10"
                            indicatorClassName={
                              achievement.completed 
                                ? 'bg-gradient-to-r from-primary to-accent' 
                                : 'bg-primary'
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
} 