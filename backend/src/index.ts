import express from "express";
import { sequelize } from "./db/seq";

import "./models/user";
import "./models/auction";
import "./models/bid";
import { auctionRouter } from "./routes/auction";
import { bidRouter } from "./routes/bid";
import { authRouter } from "./routes/auth";

const app = express();
app.use(express.json());
app.use("/api/v1/auction", auctionRouter);
app.use("/api/v1/bid", bidRouter);
app.use("/api/v1/auth", authRouter);
app.listen(3000, async () => {
  console.log("Starting server on port 3000...");

  try {
    await sequelize.authenticate();
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
