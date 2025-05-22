import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("Connected to Redis");
  }
};
