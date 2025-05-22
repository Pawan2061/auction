import express from "express";
import { login, register } from "../controller/auth";

export const authRouter = express.Router();

authRouter.post("/signup", register);

authRouter.post("/login", login);
