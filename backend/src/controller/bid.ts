import { Request, Response } from "express";
import { Server } from "socket.io";
import Bid from "../models/bid";
import Auction from "../models/auction";
import User from "../models/user";
import { AuctionService } from "../utils/auctionService";

interface AuthRequest extends Request {
  userId?: string;
}

let io: Server;

export const setSocketIO = (socketIO: Server) => {
  io = socketIO;
};

export const placeBid = async (req: AuthRequest, res: any) => {
  try {
    const { auctionId, amount } = req.body;
    const userId = req.userId!;

    if (!auctionId || !amount) {
      return res
        .status(400)
        .json({ error: "Auction ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Bid amount must be positive" });
    }

    const isActive = await AuctionService.isAuctionActive(auctionId);
    if (!isActive) {
      return res
        .status(400)
        .json({ error: "Auction is not active or has ended" });
    }

    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    const currentHighestBid = await AuctionService.getHighestBid(auctionId);
    const minimumBid = currentHighestBid || auction.startingPrice;

    if (amount <= minimumBid) {
      return res.status(400).json({
        error: `Bid must be higher than current price of $${minimumBid}`,
      });
    }

    if (auction.userId === userId) {
      return res
        .status(400)
        .json({ error: "You cannot bid on your own auction" });
    }

    const bid = await Bid.create({
      amount,
      auctionId,
      userId,
    });

    await AuctionService.setHighestBid(auctionId, amount, bid.id);

    await auction.update({ highestBidId: bid.id });

    const bidWithUser = await Bid.findByPk(bid.id, {
      include: [
        {
          model: User,
          as: "bidder",
          attributes: ["id", "username"],
        },
      ],
    });

    if (io) {
      io.to(`auction_${auctionId}`).emit("newBid", {
        bid: bidWithUser,
        currentPrice: amount,
        auctionId,
      });
    }

    res.status(201).json({
      message: "Bid placed successfully",
      bid: bidWithUser,
    });
  } catch (error) {
    console.error("Place bid error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAuctionBids = async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;

    const bids = await Bid.findAll({
      where: { auctionId },
      include: [
        {
          model: User,
          as: "bidder",
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ bids });
  } catch (error) {
    console.error("Get auction bids error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
