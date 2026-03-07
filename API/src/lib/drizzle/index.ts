import { drizzle } from "drizzle-orm/libsql/http";
import { env } from "../env.js";
import * as schema from "./schema.js";

export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_TOKEN,
  },
  schema: schema,
});
