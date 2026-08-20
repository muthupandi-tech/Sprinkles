import { prisma } from "./src/infrastructure/database/prisma";

async function main() {
  try {
    console.log("Testing weeklyReports...");
    await prisma.weeklyReport.findMany();
    console.log("weeklyReports OK");

    console.log("Testing learningPlan...");
    await prisma.learningPlan.findMany();
    console.log("learningPlan OK");

    console.log("Testing goals...");
    await prisma.goal.findMany();
    console.log("goals OK");
    
    console.log("Testing speechAttempt...");
    await prisma.speechAttempt.findMany();
    console.log("speechAttempt OK");
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    process.exit(0);
  }
}

main();
