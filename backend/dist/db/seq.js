"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
exports.sequelize = new sequelize_1.Sequelize("postgresql://postgres:Kr@ken2128@db.llmxqwikhthywcpyhahq.supabase.co:5432/postgres");
