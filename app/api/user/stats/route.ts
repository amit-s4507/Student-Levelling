import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
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

    // Calculate level based on points
    const level = calculateLevel(user.points);

    // Calculate total quizzes taken
    const totalQuizzes = user.quizAttempts.length;

    // Calculate course progress
    const courseProgress = calculateCourseProgress(user.quizAttempts);

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

function calculateCourseProgress(attempts: { courseId: string; score: number; total: number }[]): Record<string, number> {
  const courses = ['programming', 'math', 'science'];
  const progress: Record<string, number> = {};

  for (const course of courses) {
    const courseAttempts = attempts.filter(a => a.courseId === course);
    if (courseAttempts.length > 0) {
      // Calculate average score as a percentage
      const totalScore = courseAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total * 100), 0);
      progress[course] = Math.round(totalScore / courseAttempts.length);
    } else {
      progress[course] = 0;
    }
  }

  return progress;
} 