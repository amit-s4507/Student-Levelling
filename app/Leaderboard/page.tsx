import { Metadata } from 'next';
import LeaderboardClient from './leaderboard-client';

export const metadata: Metadata = {
  title: 'Leaderboard - Student Levelling',
  description: 'View the top performers and your ranking in Student Levelling',
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
