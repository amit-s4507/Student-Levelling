import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { startOfWeek, startOfMonth } from 'date-fns';
import { User, QuizAttempt, Achievement } from '@prisma/client';

interface UserWithRelations extends User {
    quizAttempts: QuizAttempt[];
    achievements: Achievement[];
}

export async function GET(request: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const timeframe = searchParams.get('timeframe') || 'all';

        // Get date range based on timeframe
        let startDate: Date | undefined;
        if (timeframe === 'weekly') {
            startDate = startOfWeek(new Date());
        } else if (timeframe === 'monthly') {
            startDate = startOfMonth(new Date());
        }

        // Get all users with their quiz attempts and achievements
        const users = await prisma.user.findMany({
            include: {
                quizAttempts: {
                    where: startDate ? {
                        createdAt: {
                            gte: startDate
                        }
                    } : undefined
                },
                achievements: true
            },
            orderBy: {
                points: 'desc'
            }
        });

        // Transform and rank users
        const leaderboard = users.map((user: UserWithRelations, index: number) => ({
            rank: index + 1,
            id: user.id,
            name: user.name || 'Anonymous',
            points: user.points,
            level: user.level,
            quizCount: user.quizAttempts.length,
            achievementCount: user.achievements.length,
            isCurrentUser: user.id === userId
        }));

        // Get current user's rank
        const currentUserRank = leaderboard.findIndex((entry) => entry.id === userId) + 1;
        const currentUserData = leaderboard.find((entry) => entry.id === userId) || null;

        // Return only top 10 users
        return NextResponse.json({
            leaderboard: leaderboard.slice(0, 10),
            currentUserRank,
            currentUserData,
            pagination: {
                currentPage: 1,
                totalPages: Math.ceil(leaderboard.length / 10),
                hasNextPage: leaderboard.length > 10,
                hasPreviousPage: false
            }
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 