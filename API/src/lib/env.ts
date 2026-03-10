import { z } from "@sherlockapp/shared";

export const env = z
  .object({
    BETTER_AUTH_SECRET: z.string(),
    DATABASE_URL: z.string(),
    REDIS_URL: z.string(),
    REDIS_TOKEN: z.string(),
    DATABASE_TOKEN: z.string().optional(),
  })
  .parse({
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,
    DATABASE_TOKEN: process.env.DATABASE_TOKEN,
  });
