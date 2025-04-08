import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../shared/schema";

async function main() {
  console.log("Starting database migration...");
  
  // Use same connection string as in db.ts
  const connectionString = process.env.DATABASE_URL!;
  console.log("Using connection string:", connectionString);
  
  // For migrations, we need more connections
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });
  
  console.log("Connected to database, running migrations...");
  
  // This will automatically create tables based on our schema
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
  
  await client.end();
  process.exit(0);
}

main();