"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
require("./models/user");
require("./models/auction");
require("./models/bid");
const app = (0, express_1.default)();
app.use(express_1.default.json());
exports.sequelize = new sequelize_1.Sequelize("postgresql://postgres:Kr@ken2128@db.llmxqwikhthywcpyhahq.supabase.co:5432/postgres", {
    dialect: "postgres",
    logging: false,
});
app.listen(3000, async () => {
    try {
        await exports.sequelize.authenticate();
        console.log("Database connected");
        await exports.sequelize.sync({ alter: true }); // <-- This must run after models are imported
        console.log("Models synced");
    }
    catch (err) {
        console.error("Error:", err);
    }
    console.log("Server running on port 3000");
});
