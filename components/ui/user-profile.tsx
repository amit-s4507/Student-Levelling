"use client";

import { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { Card } from "./card";

interface UserStats {
  points: number;
  level: string;
  totalQuizzes: number;
  name: string;
}

export function UserProfile() {
  const { user } = useUser();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Initialize user in database
        const response = await fetch('/api/user/init', {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to initialize user');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    const fetchUserStats = async () => {
      try {
        const response = await fetch('/api/user/stats');
        if (!response.ok) throw new Error('Failed to fetch user stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeUser().then(() => fetchUserStats());
    }
  }, [user]);

  if (!user || loading) return null;

  return (
    <Card className="p-4 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img 
            src={user.imageUrl || 'https://via.placeholder.com/40'} 
            alt={stats?.name || user.fullName || 'User'} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold">{stats?.name || user.fullName || 'User'}</h3>
          {stats && (
            <p className="text-sm text-gray-600">Level: {stats.level}</p>
          )}
        </div>
      </div>
      {stats && (
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{stats.points}</p>
          <p className="text-sm text-gray-600">Points</p>
          <p className="text-xs text-gray-500">Quizzes taken: {stats.totalQuizzes}</p>
        </div>
      )}
    </Card>
  );
} 