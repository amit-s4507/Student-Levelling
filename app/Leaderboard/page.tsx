"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    level: string;
    recentAchievement: string;
}

const dummyData: LeaderboardEntry[] = [
    {
        rank: 1,
        name: "Alex Thompson",
        score: 2500,
        level: "Master",
        recentAchievement: "Completed Advanced Mathematics"
    },
    {
        rank: 2,
        name: "Sarah Chen",
        score: 2350,
        level: "Expert",
        recentAchievement: "Perfect Score in Programming"
    },
    {
        rank: 3,
        name: "Michael Rodriguez",
        score: 2200,
        level: "Expert",
        recentAchievement: "Science Explorer Badge"
    },
    {
        rank: 4,
        name: "Emily Johnson",
        score: 2100,
        level: "Advanced",
        recentAchievement: "7-Day Study Streak"
    },
    {
        rank: 5,
        name: "David Kim",
        score: 2000,
        level: "Advanced",
        recentAchievement: "Math Whiz Badge"
    },
    {
        rank: 6,
        name: "Lisa Patel",
        score: 1900,
        level: "Intermediate",
        recentAchievement: "Quick Starter Badge"
    },
    {
        rank: 7,
        name: "James Wilson",
        score: 1800,
        level: "Intermediate",
        recentAchievement: "Completed Basic Programming"
    },
    {
        rank: 8,
        name: "Anna Martinez",
        score: 1700,
        level: "Intermediate",
        recentAchievement: "Science Quiz Master"
    },
    {
        rank: 9,
        name: "Ryan Taylor",
        score: 1600,
        level: "Beginner",
        recentAchievement: "First Perfect Score"
    },
    {
        rank: 10,
        name: "Sophie Anderson",
        score: 1500,
        level: "Beginner",
        recentAchievement: "Started Learning Journey"
    }
];

export default function LeaderboardPage() {
    const { userId } = auth();

    if (!userId) {
        redirect("/");
    }

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setLeaderboard(dummyData);
            setIsLoading(false);
        }, 1000);
    }, []);

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
            <h1 className="text-3xl font-bold mb-8">Student Leaderboard</h1>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {leaderboard.map((entry) => (
                        <Card
                            key={entry.rank}
                            className={`p-6 border-l-4 ${getRankStyle(entry.rank)} transition-transform hover:scale-[1.01]`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-2xl font-bold w-8">#{entry.rank}</div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{entry.name}</h3>
                                        <p className={`text-sm font-medium ${getLevelColor(entry.level)}`}>
                                            {entry.level}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{entry.score}</div>
                                    <p className="text-sm text-gray-500">points</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-600">
                                    Recent Achievement: {entry.recentAchievement}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
