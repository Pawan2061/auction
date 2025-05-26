import express from "express";
import {
  acceptBid,
  getAuctionBids,
  placeBid,
  rejectBid,
} from "../controller/bid";
import { authenticateToken } from "../middlewares/jwt";

export const bidRouter = express.Router();
bidRouter.post("/", authenticateToken, placeBid);

bidRouter.get("/", authenticateToken, getAuctionBids);
bidRouter.put("/accept/:bidId", authenticateToken, acceptBid);
bidRouter.put("/reject/:bidId", authenticateToken, rejectBid);
