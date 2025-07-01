"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  icon: string;
  unlocked: boolean;
}

const dummyAchievements: Achievement[] = [
  {
    id: "quick-starter",
    title: "Quick Starter",
    description: "Complete your first lesson",
    progress: 1,
    maxProgress: 1,
    icon: "/icons/bronzemedal.svg",
    unlocked: true
  },
  {
    id: "math-whiz",
    title: "Math Whiz",
    description: "Score 100% in 3 math quizzes",
    progress: 2,
    maxProgress: 3,
    icon: "/icons/silvermedal.svg",
    unlocked: false
  },
  {
    id: "coding-master",
    title: "Coding Master",
    description: "Complete all programming fundamentals",
    progress: 8,
    maxProgress: 10,
    icon: "/icons/goldmedal.svg",
    unlocked: false
  },
  {
    id: "science-explorer",
    title: "Science Explorer",
    description: "Complete 5 science experiments",
    progress: 3,
    maxProgress: 5,
    icon: "/icons/bronzemedal.svg",
    unlocked: false
  },
  {
    id: "study-streak",
    title: "Study Streak",
    description: "Study for 7 consecutive days",
    progress: 5,
    maxProgress: 7,
    icon: "/icons/silvermedal.svg",
    unlocked: false
  },
  {
    id: "perfect-score",
    title: "Perfect Score",
    description: "Get 100% in any quiz",
    progress: 1,
    maxProgress: 1,
    icon: "/icons/goldmedal.svg",
    unlocked: true
  }
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAchievements(dummyAchievements);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Achievements</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-6 ${
                achievement.unlocked
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={achievement.icon}
                    alt={achievement.title}
                    fill
                    className={achievement.unlocked ? "opacity-100" : "opacity-50"}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  <div className="space-y-2">
                    <Progress
                      value={(achievement.progress / achievement.maxProgress) * 100}
                    />
                    <p className="text-sm text-gray-500">
                      Progress: {achievement.progress}/{achievement.maxProgress}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 