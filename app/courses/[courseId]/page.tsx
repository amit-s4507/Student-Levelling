"use client";

import { useState } from 'react';
import { auth } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { data as programmingData } from '@/data/programming.d';
import { data as mathData } from '@/data/math.d';
import { data as scienceData } from '@/data/science.d';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Confetti from "@/components/Confetti";

interface CourseData {
  title: string;
  description: string;
  questions: {
    question: string;
    options: string[];
    correctOption: string;
  }[];
}

const courseDataMap: { [key: string]: CourseData } = {
  'programming': programmingData,
  'math': mathData,
  'science': scienceData,
};

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);

  const courseData = courseDataMap[params.courseId];

  if (!courseData) {
    router.push("/dashboard");
    return null;
  }

  const currentQuestion = courseData.questions[currentQuestionIndex];
  const totalQuestions = courseData.questions.length;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption === currentQuestion.correctOption) {
      setScore(score + 1);
    }

    const newProgress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    setProgress(newProgress);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResults(false);
    setProgress(0);
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
      <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
      <p className="text-gray-600 mb-4">{courseData.description}</p>

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