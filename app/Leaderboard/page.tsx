"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    level: string;
    recentAchievement?: string;
    userId: string;
}

export default function LeaderboardPage() {
    const { userId } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');

    useEffect(() => {
        if (!userId) {
            redirect("/");
        }
        fetchLeaderboard();
    }, [userId, timeframe]);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            const data = await response.json();
            setLeaderboard(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getLevel = (score: number): string => {
        if (score >= 2000) return "Master";
        if (score >= 1500) return "Expert";
        if (score >= 1000) return "Advanced";
        if (score >= 500) return "Intermediate";
        return "Beginner";
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-yellow-100 border-yellow-500";
            case 2:
                return "bg-gray-100 border-gray-500";
            case 3:
                return "bg-orange-100 border-orange-500";
            default:
                return "bg-white";
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Master":
                return "text-purple-600";
            case "Expert":
                return "text-blue-600";
            case "Advanced":
                return "text-green-600";
            case "Intermediate":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Student Leaderboard</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeframe('all')}
                        className={`px-4 py-2 rounded ${timeframe === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        All Time
                    </button>
                    <button
                        onClick={() => setTimeframe('monthly')}
                        className={`px-4 py-2 rounded ${timeframe === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setTimeframe('weekly')}
                        className={`px-4 py-2 rounded ${timeframe === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Weekly
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {leaderboard.map((entry) => (
                        <Card
                            key={entry.userId}
                            className={`p-6 border-l-4 ${getRankStyle(entry.rank)} transition-transform hover:scale-[1.01]`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-2xl font-bold w-8">#{entry.rank}</div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{entry.name}</h3>
                                        <p className={`text-sm font-medium ${getLevelColor(entry.level || getLevel(entry.score))}`}>
                                            {entry.level || getLevel(entry.score)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{entry.score}</div>
                                    <p className="text-sm text-gray-500">points</p>
                                </div>
                            </div>
                            {entry.recentAchievement && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600">
                                        Recent Achievement: {entry.recentAchievement}
                                    </p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
