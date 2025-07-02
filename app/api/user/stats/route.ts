import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        quizAttempts: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        achievements: {
          orderBy: {
            updatedAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Calculate course progress
    const courseProgress: Record<string, number> = {};
    const courses = ['programming', 'math', 'science'];

    for (const course of courses) {
      const courseQuizzes = user.quizAttempts.filter(q => q.courseId === course);
      const perfectScores = courseQuizzes.filter(q => q.score === 10).length;
      const progressPercentage = Math.min((perfectScores / 10) * 100, 100);
      courseProgress[course] = progressPercentage;
    }

    // Calculate total quizzes
    const totalQuizzes = user.quizAttempts.length;

    // Format achievements
    const achievements = user.achievements.map(achievement => ({
      type: achievement.type,
      progress: achievement.progress,
      maxProgress: achievement.maxProgress,
      completed: achievement.completed
    }));

    // Get recent activity
    const recentActivity = user.quizAttempts.slice(0, 5).map(attempt => ({
      courseId: attempt.courseId,
      score: attempt.score,
      total: attempt.total,
      date: attempt.createdAt
    }));

    return NextResponse.json({
      points: user.points,
      name: user.name,
      level: calculateLevel(user.points),
      totalQuizzes,
      courseProgress,
      achievements,
      recentActivity,
      studyStreak: user.studyStreak || 0,
      lastStudyDate: user.lastStudyDate
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function calculateLevel(points: number): string {
  if (points >= 1000) return 'Expert';
  if (points >= 500) return 'Advanced';
  if (points >= 200) return 'Intermediate';
  return 'Beginner';
} 