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
  difficulty?: string;
  category?: string;
  attemptCount: number;
  successRate: number;
}

interface CourseData {
  title: string;
  description: string;
  questions: Omit<Question, 'attemptCount' | 'successRate'>[];
}

const courseDataMap: { [key: string]: CourseData } = {
  'math': {
    ...mathData,
    questions: mathData.questions.map(q => ({
      ...q,
      difficulty: 'medium',
      category: 'general'
    }))
  },
  'programming': {
    ...programmingData,
    questions: programmingData.questions.map(q => ({
      ...q,
      difficulty: 'medium',
      category: 'general'
    }))
  },
  'science': {
    ...scienceData,
    questions: scienceData.questions.map(q => ({
      ...q,
      difficulty: 'medium',
      category: 'general'
    }))
  }
};

export async function generateQuizQuestions(courseId: string, count: number = 10) {
  try {
    // Get base questions from the course data
    const baseQuestions = courseDataMap[courseId]?.questions || [];
    
    if (baseQuestions.length === 0) {
      throw new Error(`No questions found for course: ${courseId}`);
    }

    // Create a mix of static and dynamic questions
    let questions: Question[] = [];
    
    // Add some static questions (but randomized)
    const shuffled = [...baseQuestions].sort(() => Math.random() - 0.5);
    const staticQuestions = shuffled.slice(0, Math.floor(count * 0.7)).map(q => ({
      ...q,
      attemptCount: 0,
      successRate: 0
    }));
    questions = questions.concat(staticQuestions);

    // Add dynamic questions based on course type
    const remainingCount = count - questions.length;
    const dynamicQuestions = await generateDynamicQuestions(courseId, remainingCount);
    questions = questions.concat(dynamicQuestions);

    // Final shuffle of all questions
    questions = questions.sort(() => Math.random() - 0.5);

    try {
      // Store in database with attempt tracking
      const storedQuestions = await Promise.all(
        questions.map(q => 
          prisma.quizQuestion.create({
            data: {
              courseId,
              question: q.question,
              options: q.options,
              correctOption: q.correctOption,
              difficulty: q.difficulty || 'medium',
              category: q.category || 'general',
              attemptCount: 0,
              successRate: 0
            }
          })
        )
      );
      return storedQuestions;
    } catch (dbError) {
      console.error('Failed to store questions in database:', dbError);
      return questions.map((q, index) => ({
        ...q,
        id: `temp-${index}`
      }));
    }
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}

async function generateDynamicQuestions(courseId: string, count: number): Promise<Question[]> {
  const questions: Question[] = [];
  
  switch(courseId) {
    case 'math':
      for(let i = 0; i < count; i++) {
        questions.push(generateMathQuestion());
      }
      break;
    case 'programming':
      for(let i = 0; i < count; i++) {
        questions.push(generateProgrammingQuestion());
      }
      break;
    case 'science':
      for(let i = 0; i < count; i++) {
        questions.push(generateScienceQuestion());
      }
      break;
  }
  
  return questions;
}

function generateMathQuestion(): Question {
  const operations = ['+', '-', '*'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  const num1 = Math.floor(Math.random() * 100);
  const num2 = Math.floor(Math.random() * 100);
  
  let correctAnswer: number;
  switch(op) {
    case '+': correctAnswer = num1 + num2; break;
    case '-': correctAnswer = num1 - num2; break;
    case '*': correctAnswer = num1 * num2; break;
    default: correctAnswer = num1 + num2;
  }
  
  const options = [
    correctAnswer.toString(),
    (correctAnswer + Math.floor(Math.random() * 10) + 1).toString(),
    (correctAnswer - Math.floor(Math.random() * 10) - 1).toString(),
    (correctAnswer * 2).toString()
  ].sort(() => Math.random() - 0.5);

  return {
    question: `What is ${num1} ${op} ${num2}?`,
    options,
    correctOption: correctAnswer.toString(),
    difficulty: 'medium',
    category: 'arithmetic',
    attemptCount: 0,
    successRate: 0
  };
}

function generateProgrammingQuestion(): Question {
  const concepts = [
    {
      template: "What is the output of: console.log({value})?",
      values: ['2 + "2"', '"2" + 2', '2 + 2', 'true + 1'],
      answers: ['22', '22', '4', '2']
    },
    {
      template: "Which data type is {value} in JavaScript?",
      values: ['null', 'undefined', '[]', '{}'],
      answers: ['object', 'undefined', 'object', 'object']
    }
  ];
  
  const concept = concepts[Math.floor(Math.random() * concepts.length)];
  const index = Math.floor(Math.random() * concept.values.length);
  
  const correctAnswer = concept.answers[index];
  const options = [
    correctAnswer,
    ...concept.answers.filter((a, i) => i !== index)
  ].sort(() => Math.random() - 0.5).slice(0, 4);

  return {
    question: concept.template.replace('{value}', concept.values[index]),
    options,
    correctOption: correctAnswer,
    difficulty: 'medium',
    category: 'javascript',
    attemptCount: 0,
    successRate: 0
  };
}

function generateScienceQuestion(): Question {
  type QuestionType = {
    template: string;
    elements?: string[];
    quantities?: string[];
    answers: string[];
  };

  const questions: QuestionType[] = [
    {
      template: "What is the chemical symbol for {element}?",
      elements: ['Gold', 'Silver', 'Iron', 'Copper'],
      answers: ['Au', 'Ag', 'Fe', 'Cu']
    },
    {
      template: "What is the unit of measurement for {quantity}?",
      quantities: ['force', 'pressure', 'energy', 'power'],
      answers: ['Newton', 'Pascal', 'Joule', 'Watt']
    }
  ];
  
  const questionType = questions[Math.floor(Math.random() * questions.length)];
  const isChemistry = 'elements' in questionType;
  const values = isChemistry ? questionType.elements! : questionType.quantities!;
  const index = Math.floor(Math.random() * values.length);
  
  const correctAnswer = questionType.answers[index];
  const options = [
    correctAnswer,
    ...questionType.answers.filter((a, i) => i !== index)
  ].sort(() => Math.random() - 0.5).slice(0, 4);

  return {
    question: questionType.template.replace(
      isChemistry ? '{element}' : '{quantity}',
      values[index]
    ),
    options,
    correctOption: correctAnswer,
    difficulty: 'medium',
    category: isChemistry ? 'chemistry' : 'physics',
    attemptCount: 0,
    successRate: 0
  };
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