import { PrismaClient } from '@prisma/client';
import { data as mathData } from '@/data/math.d';
import { data as programmingData } from '@/data/programming.d';
import { data as scienceData } from '@/data/science.d';

const prisma = new PrismaClient();

interface Question {
  id?: string;
  question: string;
  options: string[];
  correctOption: string;
}

interface CourseData {
  title: string;
  description: string;
  questions: Question[];
}

const courseDataMap: { [key: string]: CourseData } = {
  'math': mathData,
  'programming': programmingData,
  'science': scienceData,
};

export async function generateQuizQuestions(courseId: string, count: number = 10) {
  try {
    // Get base questions from the course data
    const baseQuestions = courseDataMap[courseId]?.questions || [];
    
    if (baseQuestions.length === 0) {
      throw new Error(`No questions found for course: ${courseId}`);
    }

    // Shuffle and select random questions
    const shuffled = [...baseQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    try {
      // Try to store in database, but continue even if it fails
      const questions = await Promise.all(
        selected.map(q => 
          prisma.quizQuestion.create({
            data: {
              courseId,
              question: q.question,
              options: q.options,
              correctOption: q.correctOption,
            }
          })
        )
      );
      return questions;
    } catch (dbError) {
      console.error('Failed to store questions in database:', dbError);
      // If database operation fails, return the questions without database IDs
      return selected.map((q, index) => ({
        ...q,
        id: `temp-${index}` // Add temporary IDs
      }));
    }
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}

export async function recordQuizAttempt(userId: string, courseId: string, score: number, total: number) {
  // Record the attempt
  await prisma.quizAttempt.create({
    data: {
      userId,
      courseId,
      score,
      total,
    }
  });

  // Update user points (10 points per correct answer)
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: {
        increment: score * 10
      }
    }
  });

  // Check and update achievements
  await updateAchievements(userId, courseId, score, total);
}

async function updateAchievements(userId: string, courseId: string, score: number, total: number) {
  // Get user's current achievements
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { achievements: true }
  });

  if (!user) return;

  // Update course-specific achievements
  if (courseId === 'math') {
    await updateMathAchievements(userId, score, total);
  } else if (courseId === 'programming') {
    await updateProgrammingAchievements(userId, score, total);
  } else if (courseId === 'science') {
    await updateScienceAchievements(userId, score, total);
  }

  // Update general achievements
  if (score === total) {
    await prisma.achievement.upsert({
      where: {
        userId_type: {
          userId,
          type: 'Perfect Score'
        }
      },
      update: {
        progress: 1,
        completed: true
      },
      create: {
        userId,
        type: 'Perfect Score',
        progress: 1,
        maxProgress: 1,
        completed: true
      }
    });
  }
}

async function updateMathAchievements(userId: string, score: number, total: number) {
  const attempts = await prisma.quizAttempt.count({
    where: {
      userId,
      courseId: 'math',
      score: total // Perfect score
    }
  });

  if (attempts >= 3) {
    await prisma.achievement.upsert({
      where: {
        userId_type: {
          userId,
          type: 'Math Whiz'
        }
      },
      update: {
        progress: 3,
        completed: true
      },
      create: {
        userId,
        type: 'Math Whiz',
        progress: attempts,
        maxProgress: 3,
        completed: attempts >= 3
      }
    });
  }
}

async function updateProgrammingAchievements(userId: string, score: number, total: number) {
  const attempts = await prisma.quizAttempt.count({
    where: {
      userId,
      courseId: 'programming'
    }
  });

  await prisma.achievement.upsert({
    where: {
      userId_type: {
        userId,
        type: 'Coding Master'
      }
    },
    update: {
      progress: attempts,
      completed: attempts >= 10
    },
    create: {
      userId,
      type: 'Coding Master',
      progress: attempts,
      maxProgress: 10,
      completed: attempts >= 10
    }
  });
}

async function updateScienceAchievements(userId: string, score: number, total: number) {
  const attempts = await prisma.quizAttempt.count({
    where: {
      userId,
      courseId: 'science'
    }
  });

  await prisma.achievement.upsert({
    where: {
      userId_type: {
        userId,
        type: 'Science Explorer'
      }
    },
    update: {
      progress: attempts,
      completed: attempts >= 5
    },
    create: {
      userId,
      type: 'Science Explorer',
      progress: attempts,
      maxProgress: 5,
      completed: attempts >= 5
    }
  });
}

export async function getLeaderboard() {
  return prisma.user.findMany({
    orderBy: {
      points: 'desc'
    },
    take: 10,
    select: {
      id: true,
      name: true,
      points: true,
      level: true,
      achievements: {
        where: {
          completed: true
        },
        take: 1,
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });
}

export async function getUserProgress(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: true,
      quizAttempts: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }
    }
  });
} 