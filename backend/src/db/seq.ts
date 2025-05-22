// src/db/seq.ts
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "postgresql://postgres:Kr@ken2128@db.llmxqwikhthywcpyhahq.supabase.co:5432/postgres",
  {
    dialect: "postgres",
    logging: false,
  }
);
