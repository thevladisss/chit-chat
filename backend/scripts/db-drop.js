require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONDODB_DATABASE;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

const askConfirmation = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
};

const dropDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the database instance and actual database name
    const db = mongoose.connection.db;
    const dbName = db.databaseName || DATABASE_NAME;

    // Check if --force flag is provided to skip confirmation
    const forceFlag =
      process.argv.includes('--force') || process.env.FORCE_DROP === 'true';

    if (!forceFlag) {
      console.log(
        `\n⚠️  WARNING: You are about to drop the database: "${dbName}"`,
      );
      console.log('This action cannot be undone!\n');

      // In a non-interactive environment, require the --force flag
      if (!process.stdin.isTTY) {
        console.error(
          'Error: Cannot prompt for confirmation in non-interactive mode.',
        );
        console.error('Please use --force flag: npm run db:drop -- --force');
        await mongoose.connection.close();
        process.exit(1);
      }

      const confirmed = await askConfirmation(
        `Are you sure you want to drop the database "${dbName}"? (yes/no): `,
      );

      if (!confirmed) {
        console.log('Operation cancelled.');
        await mongoose.connection.close();
        process.exit(0);
      }
    }

    // Drop the database
    console.log(`Dropping database: "${dbName}"...`);
    await db.dropDatabase();
    console.log(`✅ Database "${dbName}" has been dropped successfully`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping database:', error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

dropDatabase();
