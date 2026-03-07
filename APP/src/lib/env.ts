import { z } from "./zod";

export const env = z
  .object({
    BETTER_AUTH_URL: z.url(),
    API_URL: z.url(),
  })
  .parse({
    BETTER_AUTH_URL: process.env.EXPO_PUBLIC_BETTER_AUTH_URL,
    API_URL: process.env.EXPO_PUBLIC_API_URL,
  });
