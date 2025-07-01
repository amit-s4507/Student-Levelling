/*
  Warnings:

  - Added the required column `updatedAt` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "QuizAttempt_userId_courseId_idx";

-- DropIndex
DROP INDEX "QuizQuestion_courseId_idx";

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "difficulty" SET DEFAULT 'medium',
ALTER COLUMN "difficulty" SET DATA TYPE TEXT;
