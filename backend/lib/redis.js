import "dotenv/config"; 
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";




export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
