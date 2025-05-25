import { Request, Response } from "express";
import { Server } from "socket.io";
import Bid, { BidStatus } from "../models/bid";
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

    const bid = await Bid.create({
      amount,
      auctionId,
      userId,
      status: BidStatus.PENDING,
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
      console.log(`Emitting newBid event to auction_${auctionId}`);

      io.to(`auction_${auctionId}`).emit("newBid", {
        bid: bidWithUser,
        currentPrice: amount,
        previousPrice: minimumBid,
        auctionId,
        timestamp: new Date().toISOString(),
        bidCount: await Bid.count({ where: { auctionId } }),
      });

      io.emit("bidUpdate", {
        auctionId,
        currentPrice: amount,
        bidder: bidWithUser?.bidder,
        timestamp: new Date().toISOString(),
      });

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

export const acceptBid = async (req: AuthRequest, res: any) => {
  try {
    const { bidId } = req.params;
    const userId = req.userId!;

    if (!bidId) {
      return res.status(400).json({ error: "Bid ID is required" });
    }

    const bid = await Bid.findByPk(bidId, {
      include: [
        {
          model: Auction,
          as: "auction",
          attributes: ["id", "userId", "endTime", "name"],
        },
        {
          model: User,
          as: "bidder",
          attributes: ["id", "username"],
        },
      ],
    });

    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    if (bid.auction?.userId !== userId) {
      console.log(bid.auction?.userId, "bid action id and user id is ", userId);

      return res.status(403).json({
        error: "Only the auction owner can accept bids",
      });
    }
    if (bid.status !== BidStatus.PENDING) {
      return res.status(400).json({
        error: `Bid has already been ${bid.status}`,
      });
    }

    const isActive = await AuctionService.isAuctionActive(bid.auctionId);
    if (!isActive) {
      return res.status(400).json({
        error: "Cannot accept bids on inactive or ended auctions",
      });
    }

    await bid.update({
      status: BidStatus.ACCEPTED,
      acceptedAt: new Date(),
    });

    await Bid.update(
      {
        status: BidStatus.REJECTED,
        rejectedAt: new Date(),
      },
      {
        where: {
          auctionId: bid.auctionId,
          id: { [require("sequelize").Op.ne]: bidId },
          status: BidStatus.PENDING,
        },
      }
    );

    await Auction.update(
      { endTime: new Date(), status: "closed" },
      { where: { id: bid.auctionId } }
    );

    if (io) {
      console.log(`Emitting bidAccepted event to auction_${bid.auctionId}`);

      io.to(`auction_${bid.auctionId}`).emit("bidAccepted", {
        bid: {
          ...bid.toJSON(),
          bidder: bid.bidder,
          auction: bid.auction,
        },
        message: "Bid has been accepted! Auction ended.",
        timestamp: new Date().toISOString(),
        auctionEnded: true,
      });

      io.emit("auctionEnded", {
        auctionId: bid.auctionId,
        winningBid: bid.amount,
        winner: bid.bidder,
        auctionTitle: bid.auction?.name,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      message: "Bid accepted successfully",
      bid: {
        ...bid.toJSON(),
        bidder: bid.bidder,
        auction: bid.auction,
      },
      auctionEnded: true,
    });
  } catch (error) {
    console.error("Accept bid error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const rejectBid = async (req: AuthRequest, res: any) => {
  try {
    const { bidId } = req.params;
    const userId = req.userId!;

    if (!bidId) {
      return res.status(400).json({ error: "Bid ID is required" });
    }

    const bid = await Bid.findByPk(bidId, {
      include: [
        {
          model: Auction,
          as: "auction",
          attributes: ["id", "userId", "endTime", "name"],
        },
        {
          model: User,
          as: "bidder",
          attributes: ["id", "username"],
        },
      ],
    });

    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    if (bid.auction?.userId !== userId) {
      return res.status(403).json({
        error: "Only the auction owner can reject bids",
      });
    }

    if (bid.status !== BidStatus.PENDING) {
      return res.status(400).json({
        error: `Bid has already been ${bid.status}`,
      });
    }

    const isActive = await AuctionService.isAuctionActive(bid.auctionId);
    if (!isActive) {
      return res.status(400).json({
        error: "Cannot reject bids on inactive or ended auctions",
      });
    }

    await bid.update({
      status: BidStatus.REJECTED,
      rejectedAt: new Date(),
    });

    const nextHighestBid = await Bid.findOne({
      where: {
        auctionId: bid.auctionId,
        status: BidStatus.PENDING,
      },
      order: [["amount", "DESC"]],
    });

    if (nextHighestBid) {
      await Auction.update(
        { highestBidId: nextHighestBid.id },
        { where: { id: bid.auctionId } }
      );
      await AuctionService.setHighestBid(
        bid.auctionId,
        nextHighestBid.amount,
        nextHighestBid.id
      );
    } else {
      const auction = await Auction.findByPk(bid.auctionId);
      if (auction) {
        await auction.update({ highestBidId: null });
        await AuctionService.setHighestBid(
          bid.auctionId,
          auction.startingPrice,
          ""
        );
      }
    }

    if (io) {
      console.log(`Emitting bidRejected event to auction_${bid.auctionId}`);

      io.to(`auction_${bid.auctionId}`).emit("bidRejected", {
        bid: {
          ...bid.toJSON(),
          bidder: bid.bidder,
          auction: bid.auction,
        },
        message: "Bid has been rejected",
        timestamp: new Date().toISOString(),
        newHighestBid:
          nextHighestBid?.amount || bid.auction?.startingPrice || 0,
      });

      io.to(`auction_${bid.auctionId}`).emit("priceUpdate", {
        auctionId: bid.auctionId,
        currentPrice: nextHighestBid?.amount || bid.auction?.startingPrice || 0,
        highestBidId: nextHighestBid?.id || null,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      message: "Bid rejected successfully",
      bid: {
        ...bid.toJSON(),
        bidder: bid.bidder,
        auction: bid.auction,
      },
      newHighestBid: nextHighestBid?.amount || bid.auction?.startingPrice || 0,
    });
  } catch (error) {
    console.error("Reject bid error:", error);
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

    const currentHighestBid = await AuctionService.getHighestBid(auctionId);

    const pendingBids = bids.filter((bid) => bid.status === BidStatus.PENDING);
    const acceptedBids = bids.filter(
      (bid) => bid.status === BidStatus.ACCEPTED
    );
    const rejectedBids = bids.filter(
      (bid) => bid.status === BidStatus.REJECTED
    );

    res.json({
      bids,
      currentHighestBid,
      totalBids: bids.length,
      bidsByStatus: {
        pending: pendingBids,
        accepted: acceptedBids,
        rejected: rejectedBids,
      },
      statusCounts: {
        pending: pendingBids.length,
        accepted: acceptedBids.length,
        rejected: rejectedBids.length,
      },
    });
  } catch (error) {
    console.error("Get auction bids error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const joinAuctionRoom = (req: AuthRequest, res: Response) => {
  try {
    const { auctionId } = req.params;
    const userId = req.userId;

    if (!io) {
      return res.status(500).json({ error: "Socket.IO not initialized" });
    }

    res.json({
      message: `Ready to join auction room: auction_${auctionId}`,
      roomName: `auction_${auctionId}`,
    });
  } catch (error) {
    console.error("Join auction room error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
