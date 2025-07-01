"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Achievements</h1>

      {achievements.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-lg text-gray-600">
            Complete quizzes to earn achievements!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.type}
              className={`p-6 ${
                achievement.completed 
                  ? 'bg-gradient-to-br from-yellow-50 to-yellow-100'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={getAchievementIcon(achievement.type)}
                    alt={achievement.type}
                    width={48}
                    height={48}
                    className={achievement.completed ? 'opacity-100' : 'opacity-50'}
                  />
                  {achievement.completed && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {achievement.type}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {getAchievementDescription(achievement.type)}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {achievement.progress} / {achievement.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100}
                      className="h-2"
                      indicatorClassName={
                        achievement.completed 
                          ? 'bg-green-500' 
                          : 'bg-blue-500'
                      }
                    />
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