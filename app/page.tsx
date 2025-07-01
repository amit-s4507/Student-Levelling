import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { headers } from 'next/headers';

export default async function HomePage() {
  const headersList = headers();
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Student Levelling
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your personalized learning journey starts here
          </p>
          <a
            href="/sign-in"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Interactive Learning</h2>
            <p className="text-gray-600">
              Engage with interactive lessons and quizzes designed to make learning fun and effective.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Track Progress</h2>
            <p className="text-gray-600">
              Monitor your learning journey with detailed progress tracking and achievements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">AI Assistance</h2>
            <p className="text-gray-600">
              Get help from our AI tutor and generate visual learning materials instantly.
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8">Start Learning Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Programming</h3>
              <p className="text-gray-600">Learn coding fundamentals through interactive exercises</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Mathematics</h3>
              <p className="text-gray-600">Master mathematical concepts with guided practice</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Science</h3>
              <p className="text-gray-600">Explore scientific principles through virtual experiments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
