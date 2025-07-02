# Student Levelling

A modern, gamified learning management system built with Next.js 14 and TypeScript. The platform makes learning addictive by incorporating gaming elements like points, achievements, and leaderboards.

## 🚀 Features

- **Interactive Learning Paths**: Structured courses with progressive difficulty
- **Achievement System**: Unlock badges and rewards as you learn
- **Real-time Leaderboard**: Compete with other learners
- **Smart Quiz System**: Dynamic question generation and adaptive difficulty
- **Study Groups**: Collaborative learning environment
- **AI-Powered Chat**: Get instant help with your queries
- **Progress Tracking**: Visual representation of your learning journey
- **Dark/Light Theme**: Comfortable viewing experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **State Management**: React Hooks
- **UI Components**: Radix UI, Shadcn
- **Animations**: Framer Motion, Rive
- **Development**: ESLint, Prettier

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/student-levelling.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

## 🌐 Environment Variables

Create a `.env.local` file with the following variables:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🏗️ Project Structure

```
student-levelling/
├── app/                  # Next.js 14 app directory
├── components/          # Reusable UI components
├── lib/                # Utility functions and services
├── prisma/             # Database schema and migrations
├── public/             # Static assets
└── styles/             # Global styles and CSS modules
```

## 🧪 Key Features Implementation

### Achievement System
- Dynamic achievement tracking
- Real-time progress updates
- Custom badges and rewards

### Quiz System
- Adaptive difficulty
- Performance analytics
- Instant feedback

### Leaderboard
- Real-time updates
- Weekly/Monthly/All-time rankings
- Achievement showcasing

## 🔐 Security Features

- Authentication with Clerk
- Protected API routes
- Input validation
- Rate limiting
- Secure data handling

## 🚀 Deployment

The application is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy!

## 📈 Future Enhancements

- Mobile application
- Real-time collaboration features
- Advanced analytics dashboard
- AI-powered learning recommendations
- Integration with external learning platforms

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by [Your Name]
