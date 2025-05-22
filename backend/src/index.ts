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
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync({ alter: true });
    console.log("Models synced");
  } catch (err) {
    console.error("Error:", err);
  }

  console.log("Server running on port 3000");
});
