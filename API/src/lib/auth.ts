import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./drizzle/index.js";
import * as schema from "./drizzle/schema.js";
import { env } from "./env.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "sherlockcrm://",
    "exp://",
    "exp://**",
    "exp://192.168.*.*:*/**",
  ],
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 15 * 60, // 15 minutes
    },
  },
});
