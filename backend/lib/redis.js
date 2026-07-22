import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

// ? for test and learn
// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ../.env (one level above lib/)
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});
// ? for test and learn
// console.log("URL:", process.env.UPSTASH_REDIS_REST_URL);
// console.log("TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN ? "Loaded ✅" : "Missing ❌");

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
// ? for test and learn
// await redis.set("foo", "bar");
// const value = await redis.get("foo");
// console.log(value);