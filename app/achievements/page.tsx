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

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Fetch achievements
    fetch('/api/user/stats')
      .then(res => res.json())
      .then(data => {
        setAchievements(data.achievements || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch achievements:', err);
        setLoading(false);
      });
  }, [user, isLoaded, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Loading achievements...</h1>
      </div>
    );
  }

  const getProgress = (type: string) => {
    const achievement = achievements.find(a => a.type === type);
    return achievement ? (achievement.progress / achievement.maxProgress) * 100 : 0;
  };

  const isCompleted = (type: string) => {
    return achievements.some(a => a.type === type && a.completed);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Achievements</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Math Achievement */}
        <Card className="p-6 bg-card">
          <div className="flex items-center mb-4">
            <Image
              src="/icons/bronzemedal.svg"
              alt="Math Medal"
              width={40}
              height={40}
            />
            <h3 className="text-xl font-semibold ml-3">Math Whiz</h3>
          </div>
          <p className="text-gray-600 mb-4">Get 3 perfect scores in math quizzes</p>
          <Progress value={getProgress('Math Whiz')} className="mb-2" />
          <p className="text-sm text-right">
            {isCompleted('Math Whiz') ? 'Completed!' : '0/3 completed'}
          </p>
        </Card>

        {/* Programming Achievement */}
        <Card className="p-6 bg-card">
          <div className="flex items-center mb-4">
            <Image
              src="/icons/silvermedal.svg"
              alt="Programming Medal"
              width={40}
              height={40}
            />
            <h3 className="text-xl font-semibold ml-3">Coding Master</h3>
          </div>
          <p className="text-gray-600 mb-4">Complete 10 programming quizzes</p>
          <Progress value={getProgress('Coding Master')} className="mb-2" />
          <p className="text-sm text-right">
            {isCompleted('Coding Master') ? 'Completed!' : '0/10 completed'}
          </p>
        </Card>

        {/* Science Achievement */}
        <Card className="p-6 bg-card">
          <div className="flex items-center mb-4">
            <Image
              src="/icons/goldmedal.svg"
              alt="Science Medal"
              width={40}
              height={40}
            />
            <h3 className="text-xl font-semibold ml-3">Science Explorer</h3>
          </div>
          <p className="text-gray-600 mb-4">Complete 5 science quizzes</p>
          <Progress value={getProgress('Science Explorer')} className="mb-2" />
          <p className="text-sm text-right">
            {isCompleted('Science Explorer') ? 'Completed!' : '0/5 completed'}
          </p>
        </Card>

        {/* Perfect Score Achievement */}
        <Card className="p-6 bg-card">
          <div className="flex items-center mb-4">
            <Image
              src="/icons/goldmedal.svg"
              alt="Perfect Score Medal"
              width={40}
              height={40}
            />
            <h3 className="text-xl font-semibold ml-3">Perfect Score</h3>
          </div>
          <p className="text-gray-600 mb-4">Get a perfect score in any quiz</p>
          <Progress value={getProgress('Perfect Score')} className="mb-2" />
          <p className="text-sm text-right">
            {isCompleted('Perfect Score') ? 'Completed!' : 'Not achieved yet'}
          </p>
        </Card>
      </div>

      {achievements.some(a => a.completed) && <Confetti />}
    </div>
  );
} 