import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data including quiz attempts and achievements
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
      const attempts = user.quizAttempts.filter(a => a.courseId === course);
      if (attempts.length > 0) {
        const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total), 0);
        courseProgress[course] = Math.round((totalScore / attempts.length) * 100);
      } else {
        courseProgress[course] = 0;
      }
    }

    // Calculate total quizzes taken
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

    // Calculate level based on points
    const level = calculateLevel(user.points);

    return NextResponse.json({
      points: user.points,
      name: user.name,
      level,
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
  if (points >= 5000) return "Master";
  if (points >= 3000) return "Expert";
  if (points >= 1500) return "Advanced";
  if (points >= 500) return "Intermediate";
  return "Beginner";
} 