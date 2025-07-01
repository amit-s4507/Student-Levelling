"use client"

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6"
                    >
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Student Leaderboard
                        </h1>
                        <div className="flex gap-3 p-1 bg-gray-100 rounded-lg">
                            <Button 
                                variant={timeframe === 'all' ? 'default' : 'ghost'}
                                onClick={() => setTimeframe('all')}
                                className="transition-all duration-200"
                            >
                                All Time
                            </Button>
                            <Button 
                                variant={timeframe === 'monthly' ? 'default' : 'ghost'}
                                onClick={() => setTimeframe('monthly')}
                                className="transition-all duration-200"
                            >
                                Monthly
                            </Button>
                            <Button 
                                variant={timeframe === 'weekly' ? 'default' : 'ghost'}
                                onClick={() => setTimeframe('weekly')}
                                className="transition-all duration-200"
                            >
                                Weekly
                            </Button>
                        </div>
                    </motion.div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <Card className="p-12 text-center bg-white shadow-lg rounded-xl">
                            <h3 className="text-xl font-semibold mb-2">No Entries Yet</h3>
                            <p className="text-gray-600">Complete quizzes to appear on the leaderboard!</p>
                        </Card>
                    ) : (
                        <AnimatePresence>
                            <div className="space-y-4">
                                {leaderboard.map((entry, index) => (
                                    <motion.div
                                        key={entry.userId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card 
                                            className={`p-6 flex items-center justify-between transform transition-all duration-200 hover:scale-[1.02] ${
                                                user?.id === entry.userId 
                                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
                                                    : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-6">
                                                <div className="w-12 h-12 flex items-center justify-center">
                                                    {getMedalIcon(entry.rank) ? (
                                                        <motion.div
                                                            whileHover={{ scale: 1.2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <Image
                                                                src={getMedalIcon(entry.rank)!}
                                                                alt={`Rank ${entry.rank}`}
                                                                width={32}
                                                                height={32}
                                                                className="drop-shadow-md"
                                                            />
                                                        </motion.div>
                                                    ) : (
                                                        <span className="text-xl font-bold text-gray-400">#{entry.rank}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                                        {entry.name}
                                                        {user?.id === entry.userId && (
                                                            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">You</span>
                                                        )}
                                                    </h3>
                                                    {entry.recentAchievement && (
                                                        <motion.p 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-sm text-yellow-600 flex items-center gap-1 mt-1"
                                                        >
                                                            🏆 <span className="font-medium">{entry.recentAchievement}</span>
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                                    {entry.score}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">Points</p>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
