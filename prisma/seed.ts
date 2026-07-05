import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Get all users in the system to seed them
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log(
      "No users found in the database. Please sign up an account first so it can be seeded!"
    );
    return;
  }

  for (const user of users) {
    console.log(`Seeding data for user: ${user.email} (${user.id})...`);

    // 1. Create or Update Student Profile
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: user.name || "Muthu Pandi",
        college: "National Engineering College",
        department: "Computer Science and Engineering",
        yearOfStudy: "3rd Year",
        careerGoal: "Full-Stack Software Engineer",
        targetCompany: "Google",
        englishProficiency: "Intermediate",
        preferredAccent: "Indian",
        dailyPracticeGoal: 20,
      },
    });

    // 2. Create or Update Progress records
    await prisma.progress.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        currentStreak: 5,
        overallScore: 78.5,
        speakingScore: 74.0,
        vocabularyScore: 82.0,
        pronunciationScore: 76.5,
        interviewScore: 80.0,
        totalPracticeTime: 145,
        weeklyTimeHistory: [15, 20, 10, 30, 0, 15, 25],
      },
    });

    // 3. Create Daily Missions if not present
    const missionCount = await prisma.dailyMission.count({ where: { userId: user.id } });
    if (missionCount === 0) {
      await prisma.dailyMission.createMany({
        data: [
          {
            userId: user.id,
            title: "Speak on a random topic for 2 minutes",
            description: "Practice your fluency and reduce filler words.",
            type: "speaking",
            points: 15,
            completed: true,
          },
          {
            userId: user.id,
            title: "Review 5 vocabulary cards",
            description: "Practice Spaced Repetition (SRS) words.",
            type: "vocabulary",
            points: 10,
            completed: false,
          },
          {
            userId: user.id,
            title: "Practice Indian accent pronunciation",
            description: "Master clean consonant enunciations.",
            type: "pronunciation",
            points: 10,
            completed: false,
          },
          {
            userId: user.id,
            title: "Complete a mock interview session",
            description: "Answer general behavior questions.",
            type: "interview",
            points: 25,
            completed: false,
          },
        ],
      });
    }

    // 4. Create Practice Sessions if not present
    const sessionCount = await prisma.practiceSession.count({ where: { userId: user.id } });
    if (sessionCount === 0) {
      await prisma.practiceSession.createMany({
        data: [
          {
            userId: user.id,
            type: "Speaking",
            durationMinutes: 10,
            score: 75,
            feedback: "Good pacing, but try to use more varied vocabulary expressions.",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          },
          {
            userId: user.id,
            type: "Pronunciation",
            durationMinutes: 5,
            score: 82,
            feedback: "Excellent vowel clarity. Focus on clean consonant word endings.",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
          {
            userId: user.id,
            type: "Vocabulary",
            durationMinutes: 15,
            score: 90,
            feedback: "Learned 5 advanced vocabulary terms and completed the quiz successfully.",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          },
        ],
      });
    }

    // 5. Create Vocabulary Progress if not present
    const vocabCount = await prisma.vocabularyProgress.count({ where: { userId: user.id } });
    if (vocabCount === 0) {
      await prisma.vocabularyProgress.createMany({
        data: [
          {
            userId: user.id,
            word: "Eloquent",
            definition: "Fluent or persuasive in speaking or writing.",
            learned: true,
            masteryLevel: 4,
          },
          {
            userId: user.id,
            word: "Pragmatic",
            definition: "Dealing with things sensibly and realistically in a practical way.",
            learned: true,
            masteryLevel: 3,
          },
          {
            userId: user.id,
            word: "Meticulous",
            definition: "Showing great attention to detail; very careful and precise.",
            learned: false,
            masteryLevel: 1,
          },
          {
            userId: user.id,
            word: "Articulate",
            definition: "Having or showing the ability to speak fluently and coherently.",
            learned: true,
            masteryLevel: 5,
          },
          {
            userId: user.id,
            word: "Exemplary",
            definition: "Serving as a desirable model; very good and representing the best.",
            learned: false,
            masteryLevel: 0,
          },
        ],
      });
    }

    // 6. Create Interview Sessions if not present
    const interviewCount = await prisma.interviewSession.count({ where: { userId: user.id } });
    if (interviewCount === 0) {
      await prisma.interviewSession.create({
        data: {
          userId: user.id,
          jobTitle: "Software Engineer Intern",
          company: "Google",
          durationMinutes: 15,
          overallScore: 80,
          feedback:
            "Excellent technical clarifications and coding layout discussions. Work on structuring behavioral queries using the STAR method.",
          questionsJson: [
            {
              question: "Tell me about yourself.",
              answer:
                "I am a third year computer science student at National Engineering College. I enjoy full-stack React and Next.js applications...",
              score: 85,
              feedback: "Clear and confident overview.",
            },
            {
              question: "Describe a challenging project you worked on.",
              answer:
                "I built Sprinkles, an AI communication coach application that helps students. I integrated Supabase auth and cookies...",
              score: 75,
              feedback: "Good, but describe the conflict resolution phase in greater detail.",
            },
          ],
        },
      });
    }

    // 7. Create Achievements if not present
    const achievementCount = await prisma.achievement.count({ where: { userId: user.id } });
    if (achievementCount === 0) {
      await prisma.achievement.createMany({
        data: [
          {
            userId: user.id,
            title: "First Step",
            description: "Started your first practice session on Sprinkles.",
            iconName: "Compass",
          },
          {
            userId: user.id,
            title: "Streak Master",
            description: "Maintained a 5-day communication learning streak.",
            iconName: "Flame",
          },
          {
            userId: user.id,
            title: "Eloquent Speaker",
            description: "Scored above 80 points in an active speaking practice drill.",
            iconName: "Award",
          },
        ],
      });
    }

    // 8. Create Notifications if not present
    const notificationCount = await prisma.notification.count({ where: { userId: user.id } });
    if (notificationCount === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId: user.id,
            title: "Welcome to Sprinkles!",
            message:
              "We're excited to have you here! Customize your study preferences on the profile page to get started.",
            read: false,
          },
          {
            userId: user.id,
            title: "New Daily Missions!",
            message:
              "You have 4 new daily missions waiting for you on your dashboard. Complete them to earn score boosts.",
            read: false,
          },
        ],
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
