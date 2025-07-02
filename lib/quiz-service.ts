import { PrismaClient } from '@prisma/client';
import { data as mathData } from '@/data/math.d';
import { data as programmingData } from '@/data/programming.d';
import { data as scienceData } from '@/data/science.d';

const prisma = new PrismaClient();

interface Question {
  question: string;
  options: string[];
  correctOption: string;
}

// Fisher-Yates shuffle algorithm for true randomization
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getQuestionData(courseId: string): Question[] {
  const courseData = {
    math: mathData,
    programming: programmingData,
    science: scienceData
  }[courseId];

  if (!courseData || !courseData.questions) {
    throw new Error(`Invalid course data for ${courseId}`);
  }

  return courseData.questions;
}

export async function generateQuizQuestions(courseId: string, count: number = 10) {
  try {
    const questions = getQuestionData(courseId);
    
    if (questions.length < count) {
      throw new Error(`Not enough questions available for ${courseId}. Required: ${count}, Available: ${questions.length}`);
    }

    // Shuffle both questions and options
    const shuffledQuestions = shuffleArray(questions)
      .slice(0, count)
      .map((q, index) => {
        // Also shuffle the options for each question
        const allOptions = [...q.options];
        const shuffledOptions = shuffleArray(allOptions);
        
        // Find the new index of the correct option after shuffling
        const newCorrectIndex = shuffledOptions.indexOf(q.correctOption);
        
        return {
          ...q,
          id: `${index}`,
          options: shuffledOptions,
          correctOption: q.correctOption,
          difficulty: 'medium',
          category: 'general'
        };
      });

    return shuffledQuestions;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw new Error(`Failed to generate quiz questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function recordQuizAttempt(userId: string, courseId: string, score: number, total: number) {
  try {
    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    // Create the quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        courseId,
        score,
        total,
      }
    });

    // Update user points (10 points per correct answer)
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
    const newAchievements = await updateAchievements(userId, courseId, score, total);

    return {
      score,
      points: pointsEarned,
      totalPoints: updatedUser.points,
      name: updatedUser.name,
      newAchievements
    };
  } catch (error) {
    console.error('Error recording quiz attempt:', error);
    throw error;
  }
}

async function updateAchievements(userId: string, courseId: string, score: number, total: number) {
  try {
    const newAchievements: string[] = [];

    // Get user's current achievements
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        achievements: true,
        quizAttempts: {
          where: { courseId },
          select: { score: true, total: true }
        }
      }
    });

    if (!user) return newAchievements;

    // Check for course-specific achievements
    if (courseId === 'math' && score === total) {
      const perfectScores = user.quizAttempts.filter(a => a.score === a.total).length;
      if (perfectScores >= 3) {
        const existingAchievement = user.achievements.find(a => a.type === 'Math Whiz');
        if (!existingAchievement) {
          await prisma.achievement.create({
            data: {
              userId,
              type: 'Math Whiz',
              progress: 3,
              maxProgress: 3,
              completed: true
            }
          });
          newAchievements.push('Math Whiz');
        }
      }
    }

    // Add perfect score achievement
    if (score === total) {
      const existingPerfectScore = user.achievements.find(a => a.type === 'Perfect Score');
      if (!existingPerfectScore) {
        await prisma.achievement.create({
          data: {
            userId,
            type: 'Perfect Score',
            progress: 1,
            maxProgress: 1,
            completed: true
          }
        });
        newAchievements.push('Perfect Score');
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Error updating achievements:', error);
    return [];
  }
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
      level: true
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