import express from "express";
import { getAuctionBids, placeBid } from "../controller/bid";
import { authenticateToken } from "../middlewares/jwt";

export const bidRouter = express.Router();
bidRouter.post("/", authenticateToken, placeBid);

bidRouter.get("/", getAuctionBids);
