import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth, currentUser } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the best available name
    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName 
      ? user.firstName
      : user.username 
      ? user.username
      : user.emailAddresses[0]?.emailAddress?.split('@')[0] 
      ? user.emailAddresses[0].emailAddress.split('@')[0]
      : 'Student';

    // Check if user already exists
    let dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      // Create new user if they don't exist
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          name: userName,
          email: user.emailAddresses[0]?.emailAddress,
          points: 0,
          level: 'Beginner',
          studyStreak: 0
        }
      });

      // Create initial achievements for tracking
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
              userId: dbUser!.id,
              type: achievement.type,
              progress: 0,
              maxProgress: achievement.maxProgress,
              completed: false
            }
          })
        )
      );
    } else {
      // Always update the name if it's different from the current best name
      if (dbUser.name !== userName) {
        dbUser = await prisma.user.update({
          where: { id: userId },
          data: { name: userName }
        });
      }
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error('Error initializing user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 