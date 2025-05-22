import express from "express";
import { createAuction, getAuction, getAuctions } from "../controller/auction";

export const auctionRouter = express.Router();

auctionRouter.post("/", createAuction);
auctionRouter.post("/:id", getAuction);

auctionRouter.post("/all", getAuctions);
