import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth, currentUser } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { courseId, score, total } = body;

    if (!courseId || typeof score !== 'number' || typeof total !== 'number') {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    // Get user details from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get the best available name
    const userName = clerkUser.firstName && clerkUser.lastName 
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName 
      ? clerkUser.firstName
      : clerkUser.username 
      ? clerkUser.username
      : clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] 
      ? clerkUser.emailAddresses[0].emailAddress.split('@')[0]
      : 'Student';

    // Ensure user exists and update name if needed
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // Initialize user if they don't exist
      user = await prisma.user.create({
        data: {
          id: userId,
          name: userName,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          points: 0,
          level: 'Beginner',
          studyStreak: 0
        }
      });

      // Create initial achievements
      const achievementTypes = [
        { type: 'Math Whiz', maxProgress: 3 },
        { type: 'Coding Master', maxProgress: 10 },
        { type: 'Science Explorer', maxProgress: 5 },
        { type: 'Perfect Score', maxProgress: 1 }
      ];

      await Promise.all(
        achievementTypes.map(achievement =>
          prisma.achievement.create({
            data: {
              userId,
              type: achievement.type,
              progress: 0,
              maxProgress: achievement.maxProgress,
              completed: false
            }
          })
        )
      );
    } else if (user.name !== userName) {
      // Update name if it has changed
      user = await prisma.user.update({
        where: { id: userId },
        data: { name: userName }
      });
    }

    // Record the quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        courseId,
        score,
        total
      }
    });

    // Calculate and update points (10 points per correct answer)
    const pointsEarned = score * 10;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: pointsEarned
        }
      },
      select: {
        points: true,
        name: true
      }
    });

    // Update achievements
    const newAchievements = [];

    // Check course-specific achievements
    if (courseId === 'math') {
      const perfectScores = await prisma.quizAttempt.count({
        where: {
          userId,
          courseId: 'math',
          score: {
            equals: total
          }
        }
      });

      if (perfectScores >= 3) {
        const achievement = await prisma.achievement.update({
          where: {
            userId_type: {
              userId,
              type: 'Math Whiz'
            }
          },
          data: {
            progress: 3,
            completed: true
          }
        });
        if (achievement.completed) newAchievements.push('Math Whiz');
      }
    } else if (courseId === 'programming') {
      const attempts = await prisma.quizAttempt.count({
        where: {
          userId,
          courseId: 'programming'
        }
      });

      if (attempts >= 10) {
        const achievement = await prisma.achievement.update({
          where: {
            userId_type: {
              userId,
              type: 'Coding Master'
            }
          },
          data: {
            progress: attempts,
            completed: true
          }
        });
        if (achievement.completed) newAchievements.push('Coding Master');
      }
    } else if (courseId === 'science') {
      const attempts = await prisma.quizAttempt.count({
        where: {
          userId,
          courseId: 'science'
        }
      });

      if (attempts >= 5) {
        const achievement = await prisma.achievement.update({
          where: {
            userId_type: {
              userId,
              type: 'Science Explorer'
            }
          },
          data: {
            progress: attempts,
            completed: true
          }
        });
        if (achievement.completed) newAchievements.push('Science Explorer');
      }
    }

    // Check perfect score achievement
    if (score === total) {
      const achievement = await prisma.achievement.update({
        where: {
          userId_type: {
            userId,
            type: 'Perfect Score'
          }
        },
        data: {
          progress: 1,
          completed: true
        }
      });
      if (achievement.completed) newAchievements.push('Perfect Score');
    }

    return NextResponse.json({
      success: true,
      score,
      points: pointsEarned,
      totalPoints: updatedUser.points,
      name: updatedUser.name,
      newAchievements
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 