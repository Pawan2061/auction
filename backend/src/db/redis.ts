import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const client = createClient({
  url: "redis://redis:6379",
});

// client.on("connect", () => {
//   console.log("here too");
// });
// client.on("error", (err) => {
//   console.log(err, "okay why error");

//   console.error("Redis Client Error:", err);
// });

export const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("Connected to Redis");
  }
};
