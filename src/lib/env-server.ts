import { z } from "./zod";

export const envServer = z
  .object({
    BETTER_AUTH_SECRET: z.string(),
    DATABASE_URL: z.string(),
    REDIS_URL: z.string(),
    REDIS_TOKEN: z.string(),
  })
  .parse({
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,
  });
