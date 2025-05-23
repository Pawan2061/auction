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

bidRouter.get("/", getAuctionBids);
bidRouter.put("/accept/:id", acceptBid);
bidRouter.put("/reject/:id", rejectBid);
