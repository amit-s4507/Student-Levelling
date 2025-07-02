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

interface QuizResult {
  score: number;
  points: number;
  totalPoints: number;
  newAchievements: string[];
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
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
          <div className="space-x-4">
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            <Button onClick={() => {
              setError(null);
              handleRestart();
            }}>Try Again</Button>
          </div>
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
      if (submitting) return; // Prevent double submission
      
      try {
        setSubmitting(true);
        setError(null);
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const finalScore = score + (selectedOption === currentQuestion.correctOption ? 1 : 0);
        
        // Submit quiz results
        const response = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            courseId: params.courseId,
            score: finalScore,
            total: totalQuestions
          })
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to submit quiz');
        }
        
        // Update quiz result with points and achievements
        setQuizResult({
          score: finalScore,
          points: responseData.points,
          totalPoints: responseData.totalPoints,
          newAchievements: responseData.newAchievements || []
        });

        // Show confetti for perfect score or new achievements
        if (finalScore === totalQuestions || (responseData.newAchievements && responseData.newAchievements.length > 0)) {
          setShowConfetti(true);
        }
        
        setShowResults(true);
      } catch (error) {
        console.error('Failed to record quiz attempt:', error);
        setError(error instanceof Error ? error.message : 'Failed to save quiz results. Please try again.');
      } finally {
        setSubmitting(false);
      }
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
          {showConfetti && <Confetti />}
          <h1 className="text-3xl font-bold mb-6">Quiz Complete!</h1>
          
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <p className="text-xl mb-4">
              You scored {score} out of {totalQuestions}
            </p>
            
            {quizResult && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    +{quizResult.points} Points
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Points: {quizResult.totalPoints}
                  </p>
                </div>

                {quizResult.newAchievements.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">🎉 New Achievements!</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {quizResult.newAchievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                        >
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <Image
                src={medal.icon}
                alt={`${medal.type} Medal`}
                width={80}
                height={80}
                className="mx-auto mb-4"
              />
              <p className="text-lg font-semibold">
                You earned a {medal.type} Medal!
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={handleRestart}>Try Again</Button>
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
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