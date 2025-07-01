"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserProgress } from '@/lib/quiz-service';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface Achievement {
  id: string;
  type: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

interface UserProgress {
  achievements: Achievement[];
  points: number;
  level: string;
}

export default function AchievementsPage() {
  const { user } = useUser();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      try {
        const data = await getUserProgress(user.id);
        setProgress(data);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Achievements</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Achievements</h1>
        <Card className="p-6 text-center">
          <p>Please sign in to view your achievements.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Achievements</h1>
        <div className="text-right">
          <span className="text-2xl font-bold">{progress.points}</span>
          <span className="text-sm text-gray-600 block">Total Points</span>
          <span className="text-blue-600">{progress.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {progress.achievements.map((achievement) => {
          const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
          const bgColor = achievement.completed ? "bg-green-50" : "bg-white";

          return (
            <Card key={achievement.id} className={`p-6 ${bgColor}`}>
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={achievement.completed ? "/icons/goldmedal.svg" : "/icons/silvermedal.svg"}
                    alt={achievement.type}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{achievement.type}</h2>
                  <p className="text-sm text-gray-600">
                    Progress: {achievement.progress}/{achievement.maxProgress}
                  </p>
                </div>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </Card>
          );
        })}
      </div>
    </div>
  );
} 