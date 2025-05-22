import { Request, Response } from "express";
import Auction from "../models/auction";
import User from "../models/user";
import { AuctionService } from "../utils/auctionService";

interface AuthRequest extends Request {
  userId?: string;
}

export const createAuction = async (req: AuthRequest, res: any) => {
  try {
    const { name, description, startingPrice, duration } = req.body;
    const userId = req.userId!;

    if (!name || !description || !startingPrice || !duration) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (startingPrice <= 0 || duration <= 0) {
      return res
        .status(400)
        .json({ error: "Starting price and duration must be positive" });
    }

    const auction = await Auction.create({
      name,
      description,
      startingPrice,
      duration,
      userId,
    });

    const auctionWithDetails = await AuctionService.getAuctionWithDetails(
      auction.id
    );

    res.status(201).json({
      message: "Auction created successfully",
      auction: auctionWithDetails,
    });
  } catch (error) {
    console.error("Create auction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAuctions = async (req: Request, res: any) => {
  try {
    const auctions = await Auction.findAll({
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const auctionsWithDetails = await Promise.all(
      auctions.map(async (auction) => {
        const highestBid = await AuctionService.getHighestBid(auction.id);
        const currentPrice = highestBid || auction.startingPrice;
        const timeRemaining = Math.max(
          0,
          auction.endTime.getTime() - Date.now()
        );

        return {
          ...auction.toJSON(),
          currentPrice,
          timeRemaining,
        };
      })
    );

    res.json({ auctions: auctionsWithDetails });
  } catch (error) {
    console.error("Get auctions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAuction = async (req: Request, res: any) => {
  try {
    const { id } = req.params;
    const auction = await AuctionService.getAuctionWithDetails(id);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    res.json({ auction });
  } catch (error) {
    console.error("Get auction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
