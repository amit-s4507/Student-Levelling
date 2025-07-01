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
  
  // Generate wrong options that are different from each other and the correct answer
  const wrongAnswers = new Set<string>();
  
  // Add mathematically plausible wrong answers
  const plausibleWrongAnswers: string[] = [
    (correctAnswer + Math.floor(Math.random() * 10) + 1).toString(),
    (correctAnswer - Math.floor(Math.random() * 10) - 1).toString(),
    (op === '*' ? correctAnswer + num1 : correctAnswer * 2).toString(),
    (op === '*' ? correctAnswer - num2 : Math.abs(num1 - num2)).toString(),
    (op === '+' ? num1 * num2 : num1 + num2).toString()
  ];

  while (wrongAnswers.size < 3) {
    const wrongAnswer = plausibleWrongAnswers[Math.floor(Math.random() * plausibleWrongAnswers.length)];
    if (wrongAnswer !== correctAnswer.toString()) {
      wrongAnswers.add(wrongAnswer);
    }
  }

  const options = [correctAnswer.toString(), ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);

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
      values: ['2 + "2"', '"2" + 2', '2 + 2', 'true + 1', 'false + 1', '1 + "1"', '"1" + 1', 'null + 1'],
      answers: ['22', '22', '4', '2', '1', '11', '11', '1']
    },
    {
      template: "Which data type is {value} in JavaScript?",
      values: ['null', 'undefined', '[]', '{}', 'NaN', 'true', '42', '"42"'],
      answers: ['object', 'undefined', 'object', 'object', 'number', 'boolean', 'number', 'string']
    },
    {
      template: "What will be the value of: {value}",
      values: ['typeof null', 'typeof undefined', 'typeof []', 'typeof {}', 'typeof NaN', 'typeof function(){}'],
      answers: ['object', 'undefined', 'object', 'object', 'number', 'function']
    },
    {
      template: "What is the result of: {value}?",
      values: ['[] + []', '{} + {}', '[] + {}', '{} + []', '[] == ![]', 'true + true'],
      answers: ['""', '[object Object][object Object]', '[object Object]', '0', 'true', '2']
    }
  ];
  
  const concept = concepts[Math.floor(Math.random() * concepts.length)];
  const index = Math.floor(Math.random() * concept.values.length);
  
  const correctAnswer = concept.answers[index];
  
  // Generate wrong options that are different from each other and the correct answer
  const wrongAnswers = new Set<string>();
  const allPossibleAnswers = concept.answers.filter(a => a !== correctAnswer);
  
  while (wrongAnswers.size < 3 && allPossibleAnswers.length > 0) {
    const randomIndex = Math.floor(Math.random() * allPossibleAnswers.length);
    const wrongAnswer = allPossibleAnswers[randomIndex];
    wrongAnswers.add(wrongAnswer);
    allPossibleAnswers.splice(randomIndex, 1);
  }

  // If we don't have enough wrong answers, generate some
  while (wrongAnswers.size < 3) {
    const randomValue = Math.random() < 0.5 
      ? `${Math.floor(Math.random() * 100)}`
      : `value${Math.floor(Math.random() * 100)}`;
    if (randomValue !== correctAnswer) {
      wrongAnswers.add(randomValue);
    }
  }

  const options = [correctAnswer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);

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
  const questions = [
    {
      template: "What is the chemical symbol for {element}?",
      elements: ['Gold', 'Silver', 'Iron', 'Copper', 'Sodium', 'Potassium', 'Carbon', 'Oxygen', 'Nitrogen', 'Helium'],
      answers: ['Au', 'Ag', 'Fe', 'Cu', 'Na', 'K', 'C', 'O', 'N', 'He']
    },
    {
      template: "What is the unit of measurement for {quantity}?",
      quantities: ['force', 'pressure', 'energy', 'power', 'electric current', 'temperature', 'luminous intensity', 'frequency'],
      answers: ['Newton', 'Pascal', 'Joule', 'Watt', 'Ampere', 'Kelvin', 'Candela', 'Hertz']
    },
    {
      template: "Which element has the atomic number {number}?",
      numbers: ['1', '2', '6', '7', '8', '11', '12', '13', '26', '79'],
      answers: ['Hydrogen', 'Helium', 'Carbon', 'Nitrogen', 'Oxygen', 'Sodium', 'Magnesium', 'Aluminum', 'Iron', 'Gold']
    }
  ];
  
  const questionType = questions[Math.floor(Math.random() * questions.length)];
  const isAtomicNumber = 'numbers' in questionType;
  const values = isAtomicNumber ? questionType.numbers! : 
                'elements' in questionType ? questionType.elements! : 
                questionType.quantities!;
  const index = Math.floor(Math.random() * values.length);
  
  const correctAnswer = questionType.answers[index];
  
  // Generate wrong options that are different from each other and the correct answer
  const wrongAnswers = new Set<string>();
  const allPossibleAnswers = questionType.answers.filter(a => a !== correctAnswer);
  
  while (wrongAnswers.size < 3 && allPossibleAnswers.length > 0) {
    const randomIndex = Math.floor(Math.random() * allPossibleAnswers.length);
    const wrongAnswer = allPossibleAnswers[randomIndex];
    wrongAnswers.add(wrongAnswer);
    allPossibleAnswers.splice(randomIndex, 1);
  }

  const options = [correctAnswer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);

  return {
    question: questionType.template.replace(
      isAtomicNumber ? '{number}' : 
      'elements' in questionType ? '{element}' : 
      '{quantity}',
      values[index]
    ),
    options,
    correctOption: correctAnswer,
    difficulty: 'medium',
    category: isAtomicNumber || 'elements' in questionType ? 'chemistry' : 'physics',
    attemptCount: 0,
    successRate: 0
  };
}

export async function recordQuizAttempt(userId: string, courseId: string, score: number, total: number) {
  try {
    // Record the attempt
    await prisma.quizAttempt.create({
      data: {
        userId,
        courseId,
        score,
        total,
      }
    });

    // Calculate points (10 points per correct answer)
    const pointsEarned = score * 10;

    // Update user points
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: pointsEarned
        }
      },
      select: {
        points: true
      }
    });

    // Check and update achievements
    const newAchievements = await updateAchievements(userId, courseId, score, total);

    return {
      score,
      points: pointsEarned,
      totalPoints: updatedUser.points,
      newAchievements
    };
  } catch (error) {
    console.error('Error recording quiz attempt:', error);
    throw error;
  }
}

async function updateAchievements(userId: string, courseId: string, score: number, total: number) {
  const newAchievements: string[] = [];

  // Get user's current achievements
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { achievements: true }
  });

  if (!user) return newAchievements;

  // Update course-specific achievements
  if (courseId === 'math') {
    const mathAchievement = await updateMathAchievements(userId, score, total);
    if (mathAchievement) newAchievements.push(mathAchievement);
  } else if (courseId === 'programming') {
    const programmingAchievement = await updateProgrammingAchievements(userId, score, total);
    if (programmingAchievement) newAchievements.push(programmingAchievement);
  } else if (courseId === 'science') {
    const scienceAchievement = await updateScienceAchievements(userId, score, total);
    if (scienceAchievement) newAchievements.push(scienceAchievement);
  }

  // Update general achievements
  if (score === total) {
    const perfectScore = await prisma.achievement.upsert({
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

    if (perfectScore.completed) {
      newAchievements.push('Perfect Score');
    }
  }

  return newAchievements;
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
    const achievement = await prisma.achievement.upsert({
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

    if (achievement.completed) {
      return 'Math Whiz';
    }
  }
  return null;
}

async function updateProgrammingAchievements(userId: string, score: number, total: number) {
  const attempts = await prisma.quizAttempt.count({
    where: {
      userId,
      courseId: 'programming'
    }
  });

  const achievement = await prisma.achievement.upsert({
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

  if (achievement.completed) {
    return 'Coding Master';
  }
  return null;
}

async function updateScienceAchievements(userId: string, score: number, total: number) {
  const attempts = await prisma.quizAttempt.count({
    where: {
      userId,
      courseId: 'science'
    }
  });

  const achievement = await prisma.achievement.upsert({
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

  if (achievement.completed) {
    return 'Science Explorer';
  }
  return null;
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