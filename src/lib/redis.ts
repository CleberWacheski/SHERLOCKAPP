import { Redis } from "@upstash/redis";
import { envServer } from "./env-server";

export const redis = new Redis({
  url: envServer.REDIS_URL,
  token: envServer.REDIS_TOKEN,
});
