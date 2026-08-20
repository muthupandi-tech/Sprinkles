const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verifyVocab() {
  console.log("Starting Vocabulary Verification...");
  
  const allWords = await prisma.vocabularyWord.findMany();
  console.log(`Found ${allWords.length} vocabulary words in the database.`);
  
  let errors = 0;
  
  for (const word of allWords) {
    const missingFields = [];
    if (!word.id) missingFields.push("id");
    if (!word.word) missingFields.push("word");
    if (!word.meaning) missingFields.push("meaning");
    if (!word.difficultyLevel) missingFields.push("difficultyLevel");
    if (!word.partOfSpeech) missingFields.push("partOfSpeech");
    
    if (missingFields.length > 0) {
      console.error(`Word "${word.word}" (ID: ${word.id}) is missing fields: ${missingFields.join(", ")}`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log("✅ All vocabulary words are perfectly formed!");
  } else {
    console.error(`❌ Found ${errors} vocabulary words with missing fields.`);
  }
  
  await prisma.$disconnect();
}

verifyVocab().catch(e => {
  console.error("Verification script failed:", e);
  process.exit(1);
});
