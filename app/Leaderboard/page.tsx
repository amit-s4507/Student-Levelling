"use client"

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    score: number;
    recentAchievement?: string;
}

export default function LeaderboardPage() {
    const { user } = useUser();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
                if (!response.ok) throw new Error('Failed to fetch leaderboard');
                const data = await response.json();
                setLeaderboard(data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [timeframe]);

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1: return "/icons/goldmedal.svg";
            case 2: return "/icons/silvermedal.svg";
            case 3: return "/icons/bronzemedal.svg";
            default: return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Student Leaderboard</h1>
                    <div className="flex gap-2">
                        <Button 
                            variant={timeframe === 'all' ? 'default' : 'outline'}
                            onClick={() => setTimeframe('all')}
                        >
                            All Time
                        </Button>
                        <Button 
                            variant={timeframe === 'monthly' ? 'default' : 'outline'}
                            onClick={() => setTimeframe('monthly')}
                        >
                            Monthly
                        </Button>
                        <Button 
                            variant={timeframe === 'weekly' ? 'default' : 'outline'}
                            onClick={() => setTimeframe('weekly')}
                        >
                            Weekly
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                    <Card className="p-6 text-center">
                        <p>No entries yet. Complete quizzes to appear on the leaderboard!</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {leaderboard.map((entry) => (
                            <Card 
                                key={entry.userId} 
                                className={`p-4 flex items-center justify-between ${
                                    user?.id === entry.userId ? 'bg-blue-50' : 'bg-white'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 text-center font-bold">
                                        {getMedalIcon(entry.rank) ? (
                                            <Image
                                                src={getMedalIcon(entry.rank)!}
                                                alt={`Rank ${entry.rank}`}
                                                width={24}
                                                height={24}
                                            />
                                        ) : (
                                            <span className="text-gray-500">#{entry.rank}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            {entry.name}
                                            {user?.id === entry.userId && " (You)"}
                                        </h3>
                                        {entry.recentAchievement && (
                                            <p className="text-sm text-yellow-600">
                                                🏆 Recent: {entry.recentAchievement}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {entry.score}
                                    </p>
                                    <p className="text-sm text-gray-600">Points</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
