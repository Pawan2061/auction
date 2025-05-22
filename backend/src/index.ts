import express from "express";
import { sequelize } from "./db/seq";

import "./models/user";
import "./models/auction";
import "./models/bid";

const app = express();
app.use(express.json());

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
