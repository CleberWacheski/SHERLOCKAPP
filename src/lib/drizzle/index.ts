import { drizzle } from "drizzle-orm/libsql/http";
import { envServer } from "../env-server";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    url: envServer.DATABASE_URL,
  },
  schema: schema,
});
