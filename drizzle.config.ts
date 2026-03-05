import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./src/lib/drizzle/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
