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

    // Get user's current achievements and quiz attempts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        achievements: true,
        quizAttempts: {
          where: { courseId },
          select: { 
            score: true, 
            total: true,
            courseId: true 
          }
        }
      }
    });

    if (!user) return newAchievements;

    // Update course progress achievement
    const courseProgress = Math.floor((score / total) * 100);
    await prisma.achievement.upsert({
      where: {
        userId_type: {
          userId,
          type: `${courseId}_progress`
        }
      },
      update: {
        progress: courseProgress,
        maxProgress: 100,
        completed: courseProgress === 100
      },
      create: {
        userId,
        type: `${courseId}_progress`,
        progress: courseProgress,
        maxProgress: 100,
        completed: courseProgress === 100
      }
    });

    // Perfect Score Achievement
    if (score === total) {
      const perfectScoreAchievement = await prisma.achievement.upsert({
        where: {
          userId_type: {
            userId,
            type: 'Perfect Score'
          }
        },
        update: {
          progress: 1,
          maxProgress: 1,
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
      if (!user.achievements.some(a => a.type === 'Perfect Score')) {
        newAchievements.push('Perfect Score');
      }
    }

    // Course-specific achievements
    const courseAttempts = user.quizAttempts.length + 1; // Include current attempt
    const perfectScores = user.quizAttempts.filter(a => a.score === a.total && a.courseId === courseId).length;
    const currentPerfectScores = perfectScores + (score === total ? 1 : 0);

    if (courseId === 'math') {
      const mathAchievement = await prisma.achievement.upsert({
        where: {
          userId_type: {
            userId,
            type: 'Math Whiz'
          }
        },
        update: {
          progress: currentPerfectScores,
          maxProgress: 3,
          completed: currentPerfectScores >= 3
        },
        create: {
          userId,
          type: 'Math Whiz',
          progress: currentPerfectScores,
          maxProgress: 3,
          completed: currentPerfectScores >= 3
        }
      });
      if (currentPerfectScores >= 3 && !user.achievements.some(a => a.type === 'Math Whiz' && a.completed)) {
        newAchievements.push('Math Whiz');
      }
    }

    if (courseId === 'programming' && courseAttempts >= 10) {
      const codingAchievement = await prisma.achievement.upsert({
        where: {
          userId_type: {
            userId,
            type: 'Coding Master'
          }
        },
        update: {
          progress: courseAttempts,
          maxProgress: 10,
          completed: true
        },
        create: {
          userId,
          type: 'Coding Master',
          progress: courseAttempts,
          maxProgress: 10,
          completed: true
        }
      });
      if (!user.achievements.some(a => a.type === 'Coding Master')) {
        newAchievements.push('Coding Master');
      }
    }

    if (courseId === 'science' && courseAttempts >= 5) {
      const scienceAchievement = await prisma.achievement.upsert({
        where: {
          userId_type: {
            userId,
            type: 'Science Explorer'
          }
        },
        update: {
          progress: courseAttempts,
          maxProgress: 5,
          completed: true
        },
        create: {
          userId,
          type: 'Science Explorer',
          progress: courseAttempts,
          maxProgress: 5,
          completed: true
        }
      });
      if (!user.achievements.some(a => a.type === 'Science Explorer')) {
        newAchievements.push('Science Explorer');
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Error updating achievements:', error);
    throw error;
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