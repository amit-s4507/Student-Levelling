import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Cache for leaderboard data
const leaderboardCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get search params
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Validate params
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return new NextResponse('Invalid limit parameter', { status: 400 });
    }
    if (isNaN(page) || page < 1) {
      return new NextResponse('Invalid page parameter', { status: 400 });
    }

    const cacheKey = `${timeframe}_${limit}_${page}`;
    const now = Date.now();

    // Check cache
    const cached = leaderboardCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': `private, max-age=${CACHE_TTL / 1000}`
        }
      });
    }

    // Calculate date filter
    let dateFilter = {};
    if (timeframe !== 'all') {
      const startDate = new Date();
      if (timeframe === 'weekly') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === 'monthly') {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      dateFilter = {
        createdAt: {
          gte: startDate
        }
      };
    }

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: {
        points: {
          gt: 0
        }
      }
    });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalUsers / limit);

    // Get leaderboard data with efficient querying
    const [leaderboard, currentUserRank] = await Promise.all([
      prisma.user.findMany({
        where: {
          points: {
            gt: 0
          }
        },
        select: {
          id: true,
          name: true,
          points: true,
          level: true,
          _count: {
            select: {
              quizAttempts: {
                where: dateFilter
              }
            }
          }
        },
        orderBy: {
          points: 'desc'
        },
        take: limit,
        skip
      }),
      prisma.user.count({
        where: {
          points: {
            gt: (
              await prisma.user.findUnique({
                where: { id: userId },
                select: { points: true }
              })
            )?.points || 0
          }
        }
      })
    ]);

    // Format response
    const response = {
      leaderboard: leaderboard.map((user, index) => ({
        rank: skip + index + 1,
        id: user.id,
        name: user.name,
        points: user.points,
        level: user.level,
        quizCount: user._count.quizAttempts,
        isCurrentUser: user.id === userId
      })),
      currentUserRank: currentUserRank + 1,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };

    // Cache the response
    leaderboardCache.set(cacheKey, {
      data: response,
      timestamp: now
    });

    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', `private, max-age=${CACHE_TTL / 1000}`);

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 