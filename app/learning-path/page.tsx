"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  progress: number;
  topics: string[];
  skills: string[];
  icon: string;
}

export default function LearningPath() {
  const { user } = useUser();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  // Move recommendedPaths to useMemo
  const recommendedPaths = useMemo(() => [
    {
      id: 'web-dev',
      title: 'Full-Stack Web Development',
      description: 'Master modern web development with JavaScript, React, and Node.js',
      difficulty: 'Intermediate',
      estimatedHours: 120,
      progress: 35,
      topics: ['JavaScript', 'React', 'Node.js', 'Database'],
      skills: ['Frontend', 'Backend', 'API Development'],
      icon: '/icons/javascript.svg'
    },
    {
      id: 'data-science',
      title: 'Data Science Fundamentals',
      description: 'Learn data analysis, visualization, and machine learning basics',
      difficulty: 'Beginner',
      estimatedHours: 80,
      progress: 0,
      topics: ['Python', 'Statistics', 'Machine Learning'],
      skills: ['Data Analysis', 'Visualization', 'ML Models'],
      icon: '/icons/python.svg'
    },
    {
      id: 'mobile-dev',
      title: 'Mobile App Development',
      description: 'Build cross-platform mobile apps with React Native',
      difficulty: 'Advanced',
      estimatedHours: 100,
      progress: 0,
      topics: ['React Native', 'Mobile UI', 'App Store'],
      skills: ['Mobile Development', 'UI Design', 'Testing'],
      icon: '/icons/react.svg'
    }
  ], []); // Empty dependency array since this is static data

  useEffect(() => {
    // Simulate API call to get personalized learning paths
    const fetchPaths = async () => {
      try {
        setLoading(true);
        // In production, this would be a real API call to your AI service
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        setPaths(recommendedPaths);
      } catch (error) {
        console.error('Error fetching learning paths:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPaths();
  }, [user]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-600';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-600';
      case 'Advanced':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">Your Learning Path</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            AI-powered personalized learning recommendations based on your progress and goals
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover-card">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center">
                      <Image
                        src={path.icon}
                        alt={path.title}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{path.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(path.difficulty)}`}>
                        {path.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {path.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-semibold">{path.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${path.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">Key Topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {path.topics.map(topic => (
                          <span
                            key={topic}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Skills You'll Gain:</p>
                      <div className="flex flex-wrap gap-2">
                        {path.skills.map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ⏱️ {path.estimatedHours} hours
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {path.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 