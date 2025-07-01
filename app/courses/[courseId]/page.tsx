"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Confetti from "@/components/Confetti";
import { generateQuizQuestions, recordQuizAttempt } from '@/lib/quiz-service';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctOption: string;
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const newQuestions = await generateQuizQuestions(params.courseId);
        if (!newQuestions || newQuestions.length === 0) {
          throw new Error('No questions available for this course');
        }
        setQuestions(newQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setError(error instanceof Error ? error.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [params.courseId, router, user, isLoaded]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Quiz...</h1>
          <Progress value={100} className="w-full" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No questions available</h1>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = async () => {
    if (selectedOption === currentQuestion.correctOption) {
      setScore(score + 1);
    }

    const newProgress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    setProgress(newProgress);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      try {
        // Record the quiz attempt
        if (user) {
          await recordQuizAttempt(
            user.id,
            params.courseId,
            score + (selectedOption === currentQuestion.correctOption ? 1 : 0),
            totalQuestions
          );
        }
      } catch (error) {
        console.error('Failed to record quiz attempt:', error);
        // Continue to show results even if recording fails
      }
      setShowResults(true);
    }
  };

  const handleRestart = async () => {
    try {
      setLoading(true);
      setError(null);
      const newQuestions = await generateQuizQuestions(params.courseId);
      if (!newQuestions || newQuestions.length === 0) {
        throw new Error('No questions available for this course');
      }
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedOption(null);
      setShowResults(false);
      setProgress(0);
    } catch (error) {
      console.error('Failed to load new questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load new questions');
    } finally {
      setLoading(false);
    }
  };

  const getMedal = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return { type: "Gold", icon: "/icons/goldmedal.svg" };
    if (percentage >= 60) return { type: "Silver", icon: "/icons/silvermedal.svg" };
    return { type: "Bronze", icon: "/icons/bronzemedal.svg" };
  };

  if (showResults) {
    const medal = getMedal();
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-3xl font-bold mb-6">Quiz Complete!</h1>
          <p className="text-xl mb-4">
            You scored {score} out of {totalQuestions}
          </p>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Congratulations! You earned a {medal.type} Medal!
            </h2>
            <div className="relative w-32 h-32 mx-auto">
              <Image src={medal.icon} alt={`${medal.type} Medal`} fill className="object-contain" />
            </div>
          </div>
          <Button onClick={handleRestart} className="mt-4">
            Try Again
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="mt-4 ml-4">
            Back to Dashboard
          </Button>
          <Confetti />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {params.courseId.charAt(0).toUpperCase() + params.courseId.slice(1)} Quiz
      </h1>
      <p className="text-gray-600 mb-4">Test your knowledge and earn achievements!</p>

      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedOption === option
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <Button
          onClick={handleNext}
          disabled={!selectedOption}
          className="mt-6 w-full"
        >
          {currentQuestionIndex === totalQuestions - 1 ? "Finish" : "Next"}
        </Button>
      </Card>
    </div>
  );
}