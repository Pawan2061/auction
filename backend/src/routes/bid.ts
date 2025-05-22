import express from "express";
import { getAuctionBids, placeBid } from "../controller/bid";

export const bidRouter = express.Router();
bidRouter.post("/", placeBid);

bidRouter.get("/", getAuctionBids);
