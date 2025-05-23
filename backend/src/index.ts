import express from "express";
import { sequelize } from "./db/seq";

import "./models/user";
import "./models/auction";
import "./models/bid";
import { auctionRouter } from "./routes/auction";
import { bidRouter } from "./routes/bid";
import { authRouter } from "./routes/auth";
import { connectRedis } from "./db/redis";
import { createServer } from "http";
import { AuctionService } from "./utils/auctionService";

import { Server } from "socket.io";

const app = express();
const server = createServer(app);

app.use(express.json());
export const io = new Server(server, {
  cors: {},
});

app.use("/api/v1/auction", auctionRouter);
app.use("/api/v1/bid", bidRouter);
app.use("/api/v1/auth", authRouter);
app.listen(3000, async () => {
  console.log("Starting server on port 3000...");
  io.listen(3001);

  try {
    await sequelize.authenticate();
    connectRedis();

    console.log("✅ Connected to Supabase PostgreSQL");

    // if (process.env.NODE_ENV !== "production") {
    //   await sequelize.sync({ alter: true });
    //   console.log("✅ Database models synced (development mode)");
    // } else {
    //   console.log("ℹ️ Skipping sync in production mode");
    // }

    console.log("🚀 Server running on http://localhost:3000");
  } catch (err) {
    console.error("❌ Database connection/sync error:", err);
    process.exit(1);
  }
});
