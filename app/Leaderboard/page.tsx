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

        // Initialize user data
        const initUser = async () => {
            try {
                await fetch('/api/user/init', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.error('Error initializing user:', error);
            }
        };

        if (user) {
            initUser();
        }

        fetchLeaderboard();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchLeaderboard, 5000);
        return () => clearInterval(interval);
    }, [timeframe, user]);

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1: return "/icons/goldmedal.svg";
            case 2: return "/icons/silvermedal.svg";
            case 3: return "/icons/bronzemedal.svg";
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 dark:from-background dark:via-background dark:to-primary/5">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6"
                    >
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent gradient-animate">
                            Student Leaderboard
                        </h1>
                        <div className="flex gap-3 p-1.5 bg-background/50 dark:bg-background/10 backdrop-blur-lg rounded-2xl border border-border shadow-lg">
                            <Button 
                                variant={timeframe === 'all' ? 'default' : 'ghost'}
                                onClick={() => setTimeframe('all')}
                                className="transition-all duration-300 hover:scale-105"
                            >
                                All Time
                            </Button>
                            <Button 
                                variant={timeframe === 'monthly' ? 'default' : 'ghost'}
                                onClick={() => setTimeframe('monthly')}
                                className="transition-all duration-300 hover:scale-105"
                            >
                                Monthly
                            </Button>
                            <Button 
                                variant={timeframe === 'weekly' ? 'default' : 'ghost'}
                                onClick={() => setTimeframe('weekly')}
                                className="transition-all duration-300 hover:scale-105"
                            >
                                Weekly
                            </Button>
                        </div>
                    </motion.div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <Card className="p-12 text-center glass shadow-xl rounded-2xl border-primary/20">
                            <h3 className="text-2xl font-semibold mb-4">No Entries Yet</h3>
                            <p className="text-muted-foreground">Complete quizzes to appear on the leaderboard!</p>
                        </Card>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <div className="space-y-4">
                                {leaderboard.map((entry, index) => (
                                    <motion.div
                                        key={entry.userId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ 
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 15,
                                            delay: index * 0.1 
                                        }}
                                    >
                                        <Card 
                                            className={`p-6 flex items-center justify-between transform transition-all duration-300 hover:scale-[1.02] ${
                                                user?.id === entry.userId 
                                                    ? 'glass border-primary/30 shadow-lg shadow-primary/20' 
                                                    : 'bg-card/50 backdrop-blur-sm hover:bg-card/80 border-border/50'
                                            } rounded-2xl`}
                                        >
                                            <div className="flex items-center space-x-6">
                                                <div className="w-14 h-14 flex items-center justify-center">
                                                    {getMedalIcon(entry.rank) ? (
                                                        <motion.div
                                                            whileHover={{ scale: 1.2, rotate: 5 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="animate-float"
                                                        >
                                                            <Image
                                                                src={getMedalIcon(entry.rank)!}
                                                                alt={`Rank ${entry.rank}`}
                                                                width={40}
                                                                height={40}
                                                                className="drop-shadow-xl"
                                                            />
                                                        </motion.div>
                                                    ) : (
                                                        <span className="text-2xl font-bold text-muted-foreground">#{entry.rank}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold flex items-center gap-3">
                                                        {entry.name}
                                                        {user?.id === entry.userId && (
                                                            <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">You</span>
                                                        )}
                                                    </h3>
                                                    {entry.recentAchievement && (
                                                        <motion.p 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-sm text-accent-foreground flex items-center gap-2 mt-2"
                                                        >
                                                            🏆 <span className="font-medium">{entry.recentAchievement}</span>
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent gradient-animate">
                                                    {entry.score}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">Points</p>
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
