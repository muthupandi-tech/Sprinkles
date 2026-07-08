# Sprinkles - AI Personal Communication Coach

Sprinkles is a next-generation AI-powered communication coach that helps students and professionals master spoken English, enhance vocabulary, and prepare for interviews with realistic AI roleplay. 

## Features

- **Personalized Dashboard:** Track your daily practice streaks, overall communication scores, and gamified achievements.
- **AI Speech Coaching:** Receive real-time feedback on pronunciation, fluency, and phoneme enunciation using advanced AI audio transcription.
- **Mock Interviews:** Conduct realistic behavioral and technical interviews with an AI recruiter, complete with post-interview feedback scoring.
- **Vocabulary Builder:** Spaced Repetition System (SRS) for learning and retaining new words, with contextual interview examples.
- **Group Discussions:** Simulate multi-participant group discussions with AI peers to build confidence.
- **Gamification & Leaderboard:** Earn badges for milestones, keep up daily streaks, and see how you rank among other learners.
- **Personal AI Assistant:** Get weekly study plans, motivation prompts, and daily missions to keep you on track.

## Architecture

Sprinkles is built using a modern, scalable tech stack:
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) managed via [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [Supabase Auth](https://supabase.com/)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) & OpenAI
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

## Environment Variables

To run the application, you need to set up the following environment variables in a `.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/sprinkles?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/sprinkles?schema=public"

# Supabase Auth Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# AI Provider Keys
OPENAI_API_KEY="sk-..."
```

## Installation Guide

1. **Clone the repository:**
   ```bash
   git clone https://github.com/muthupandi-tech/Sprinkles.git
   cd Sprinkles
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the Database:**
   Ensure PostgreSQL is running, then apply the Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the Database (Optional but recommended for demo):**
   ```bash
   npx prisma db seed
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Sprinkles is optimized for deployment on Vercel:

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import the repository.
3. Configure the environment variables in the Vercel dashboard.
4. Deploy! Vercel will automatically run `npm run build` and handle edge caching.

**Note:** Remember to update the Supabase Auth Redirect URLs in your Supabase project settings to include your production Vercel URL.

## License

MIT License
