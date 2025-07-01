import { UserButton, SignInButton, SignUpButton, auth } from "@clerk/nextjs";
import Link from "next/link";

export function Navigation() {
  const { userId } = auth();
  const isSignedIn = !!userId;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Student Learning</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/achievements" className="text-gray-700 hover:text-gray-900">
                  Achievements
                </Link>
                <Link href="/Leaderboard" className="text-gray-700 hover:text-gray-900">
                  Leaderboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 