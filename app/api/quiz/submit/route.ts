import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { recordQuizAttempt } from '@/lib/quiz-service';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { message: 'You must be logged in to submit a quiz' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, score, total } = body;

    // Validate input
    if (!courseId) {
      return NextResponse.json(
        { message: 'Course ID is required' },
        { status: 400 }
      );
    }
    if (typeof score !== 'number') {
      return NextResponse.json(
        { message: 'Score must be a number' },
        { status: 400 }
      );
    }
    if (typeof total !== 'number') {
      return NextResponse.json(
        { message: 'Total must be a number' },
        { status: 400 }
      );
    }
    if (score < 0 || score > total) {
      return NextResponse.json(
        { message: `Invalid score: ${score} (must be between 0 and ${total})` },
        { status: 400 }
      );
    }

    // Get user details from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { message: 'User not found. Please try logging out and back in.' },
        { status: 404 }
      );
    }

    // Record the attempt and update achievements
    const result = await recordQuizAttempt(userId, courseId, score, total);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error submitting quiz:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('User not found in database')) {
        return NextResponse.json(
          { message: 'User account not initialized. Please try logging out and back in.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 