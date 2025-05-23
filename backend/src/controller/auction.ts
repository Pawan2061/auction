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

    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 60000);
    console.log(endTime, "okay done");

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
      endTime,
    });

    const auctionWithDetails = await AuctionService.getAuctionWithDetails(
      auction.id
    );
    console.log(auctionWithDetails, "deatials here");

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
    console.log("inside this");

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
    console.log(auctions, "will be here");

    const auctionsWithDetails = await Promise.all(
      auctions.map(async (auction) => {
        const highestBid = await AuctionService.getHighestBid(auction.id);
        console.log(highestBid, "okay bid here");

        const currentPrice = highestBid || auction.startingPrice;

        const timeRemaining = Math.max(
          0,
          auction.endTime.getTime() - Date.now()
        );
        console.log(timeRemaining, "okay remaning time here");

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
    console.log(id, "id is here");

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
