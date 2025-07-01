import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';

    let dateFilter = {};
    const now = new Date();
    
    if (timeframe === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = {
        createdAt: {
          gte: weekAgo
        }
      };
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = {
        createdAt: {
          gte: monthAgo
        }
      };
    }

    // Get users with their total points and most recent achievement
    const users = await prisma.user.findMany({
      where: {
        quizAttempts: {
          some: dateFilter
        }
      },
      select: {
        id: true,
        name: true,
        points: true,
        achievements: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          where: {
            completed: true
          }
        },
        quizAttempts: {
          where: dateFilter,
          select: {
            score: true
          }
        }
      },
      orderBy: {
        points: 'desc'
      },
      take: 100
    });

    // Calculate total points for the timeframe and format the response
    const leaderboard = users.map((user, index) => {
      const timeframePoints = timeframe === 'all' 
        ? user.points 
        : user.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) * 10;

      return {
        rank: index + 1,
        userId: user.id,
        name: user.name || 'Anonymous User',
        score: timeframePoints,
        recentAchievement: user.achievements[0]?.type
      };
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 