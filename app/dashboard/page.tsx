"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserProfile } from "@/components/ui/user-profile";
import Link from "next/link";

interface CourseProgress {
  programming: number;
  math: number;
  science: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [progress, setProgress] = useState<CourseProgress>({
    programming: 0,
    math: 0,
    science: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/user/stats');
        if (!response.ok) throw new Error('Failed to fetch user stats');
        const data = await response.json();
        setProgress(data.courseProgress);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, isLoaded, router]);

  const courses = [
    {
      id: 'programming',
      title: 'Programming Fundamentals',
      description: 'Learn the basics of programming with interactive lessons',
      progress: progress.programming,
      color: 'bg-blue-500'
    },
    {
      id: 'math',
      title: 'Mathematics',
      description: 'Master mathematical concepts through gamified learning',
      progress: progress.math,
      color: 'bg-green-500'
    },
    {
      id: 'science',
      title: 'Science',
      description: 'Explore scientific concepts with interactive experiments',
      progress: progress.science,
      color: 'bg-purple-500'
    }
  ];

  const features = [
    {
      title: 'AI Chat Assistant',
      description: 'Get help with your studies',
      href: '/Chat',
      color: 'bg-pink-50'
    },
    {
      title: 'Leaderboard',
      description: 'See where you rank',
      href: '/Leaderboard',
      color: 'bg-yellow-50'
    },
    {
      title: 'Achievements',
      description: 'View your badges',
      href: '/achievements',
      color: 'bg-green-50'
    },
    {
      title: 'Image Generator',
      description: 'Create learning visuals',
      href: '/Imagen',
      color: 'bg-blue-50'
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfile />

      <h1 className="text-3xl font-bold mt-8 mb-6">My Learning Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {courses.map((course) => (
          <Link href={`/courses/${course.id}`} key={course.id}>
            <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-bold mb-2">{course.title}</h2>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>PROGRESS</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress 
                  value={course.progress} 
                  className="h-2"
                  indicatorClassName={course.color}
                />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.title}>
            <Card className={`p-6 h-full hover:shadow-lg transition-shadow cursor-pointer ${feature.color}`}>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 