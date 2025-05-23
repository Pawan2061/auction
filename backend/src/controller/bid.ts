import { Request, Response } from "express";
import { Server } from "socket.io";
import Bid from "../models/bid";
import Auction from "../models/auction";
import User from "../models/user";
import { AuctionService } from "../utils/auctionService";
import { io } from "..";

interface AuthRequest extends Request {
  userId?: string;
}

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

    // Create the bid
    const bid = await Bid.create({
      amount,
      auctionId,
      userId,
    });

    // Update highest bid in cache/service
    await AuctionService.setHighestBid(auctionId, amount, bid.id);

    // Update auction with highest bid
    await auction.update({ highestBidId: bid.id });

    // Fetch the bid with user information
    const bidWithUser = await Bid.findByPk(bid.id, {
      include: [
        {
          model: User,
          as: "bidder",
          attributes: ["id", "username"],
        },
      ],
    });

    // Enhanced socket emission with more comprehensive data
    if (io) {
      console.log(`Emitting newBid event to auction_${auctionId}`);

      // Emit to the specific auction room
      io.to(`auction_${auctionId}`).emit("newBid", {
        bid: bidWithUser,
        currentPrice: amount,
        previousPrice: minimumBid,
        auctionId,
        timestamp: new Date().toISOString(),
        bidCount: await Bid.count({ where: { auctionId } }),
      });

      // Also emit a general bid update for dashboard/notifications
      io.emit("bidUpdate", {
        auctionId,
        currentPrice: amount,
        bidder: bidWithUser?.bidder,
        timestamp: new Date().toISOString(),
      });

      // Log active connections for debugging
      const room = io.sockets.adapter.rooms.get(`auction_${auctionId}`);
      console.log(
        `Active connections in auction_${auctionId}:`,
        room?.size || 0
      );
    } else {
      console.warn("Socket.IO instance not available");
    }

    res.status(201).json({
      message: "Bid placed successfully",
      bid: bidWithUser,
      currentPrice: amount,
      previousPrice: minimumBid,
    });
  } catch (error) {
    console.error("Place bid error:", error);

    // Emit error to socket if available
    if (io && req.body.auctionId) {
      io.to(`auction_${req.body.auctionId}`).emit("bidError", {
        error: "Failed to place bid",
        auctionId: req.body.auctionId,
        timestamp: new Date().toISOString(),
      });
    }

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

    // Get current highest bid for additional context
    const currentHighestBid = await AuctionService.getHighestBid(auctionId);

    res.json({
      bids,
      currentHighestBid,
      totalBids: bids.length,
    });
  } catch (error) {
    console.error("Get auction bids error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Additional helper function to join auction room
export const joinAuctionRoom = (req: AuthRequest, res: Response) => {
  try {
    const { auctionId } = req.params;
    const userId = req.userId;

    if (!io) {
      return res.status(500).json({ error: "Socket.IO not initialized" });
    }

    // This would typically be handled in socket connection event
    // But providing endpoint for manual room joining if needed
    res.json({
      message: `Ready to join auction room: auction_${auctionId}`,
      roomName: `auction_${auctionId}`,
    });
  } catch (error) {
    console.error("Join auction room error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
