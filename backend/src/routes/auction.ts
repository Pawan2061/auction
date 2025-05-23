import express from "express";
import { createAuction, getAuction, getAuctions } from "../controller/auction";
import { authenticateToken } from "../middlewares/jwt";

export const auctionRouter = express.Router();

auctionRouter.post("/", authenticateToken, createAuction);
auctionRouter.get("/all", getAuctions);

auctionRouter.get("/:id", getAuction);
