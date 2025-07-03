'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  points: number;
  level: number;
  quizCount: number;
  achievementCount: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number;
  currentUserData: LeaderboardEntry | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function LeaderboardClient() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-4 py-2 rounded-lg ${
              timeframe === 'all' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-4 py-2 rounded-lg ${
              timeframe === 'weekly' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-4 py-2 rounded-lg ${
              timeframe === 'monthly' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {data.currentUserData && (
        <Card className="p-6 mb-8 bg-primary/5">
          <h2 className="text-2xl font-semibold mb-4">Your Ranking</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <Image
                src={`/icons/${data.currentUserRank <= 3 ? ['gold', 'silver', 'bronze'][data.currentUserRank - 1] + 'medal' : 'logo'}.svg`}
                alt="Rank"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xl font-bold">{data.currentUserData.name}</p>
              <p className="text-gray-600">Rank #{data.currentUserRank}</p>
              <p className="text-sm">Level {data.currentUserData.level} • {data.currentUserData.points} Points</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {data.leaderboard.map((entry) => (
          <Card
            key={entry.id}
            className={`p-4 ${entry.isCurrentUser ? 'border-primary border-2' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12">
                <Image
                  src={`/icons/${entry.rank <= 3 ? ['gold', 'silver', 'bronze'][entry.rank - 1] + 'medal' : 'logo'}.svg`}
                  alt="Rank"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{entry.name}</h3>
                  <span className="text-sm text-gray-600">#{entry.rank}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Level {entry.level}</span>
                  <span>{entry.points} Points</span>
                </div>
                <Progress value={(entry.points / (data.leaderboard[0]?.points || 1)) * 100} className="mt-2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 