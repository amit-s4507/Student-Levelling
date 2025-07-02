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

    const user = await currentUser();
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
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

    try {
      // Check if user already exists
      let dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          achievements: true
        }
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

        // Fetch the user again with achievements
        dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            achievements: true
          }
        });
      } else {
        // Update the name if it's different
        if (dbUser.name !== userName) {
          dbUser = await prisma.user.update({
            where: { id: userId },
            data: { name: userName },
            include: {
              achievements: true
            }
          });
        }

        // Ensure all achievement types exist
        const requiredAchievements = [
          { type: 'Math Whiz', maxProgress: 3 },
          { type: 'Coding Master', maxProgress: 10 },
          { type: 'Science Explorer', maxProgress: 5 },
          { type: 'Perfect Score', maxProgress: 1 }
        ];

        for (const achievement of requiredAchievements) {
          const exists = dbUser.achievements.some(a => a.type === achievement.type);
          if (!exists) {
            await prisma.achievement.create({
              data: {
                userId: dbUser.id,
                type: achievement.type,
                progress: 0,
                maxProgress: achievement.maxProgress,
                completed: false
              }
            });
          }
        }

        // Fetch the user one final time with all achievements
        dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            achievements: true
          }
        });
      }

      return NextResponse.json(dbUser);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new NextResponse('Database error', { status: 500 });
    }
  } catch (error) {
    console.error('Error initializing user:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 