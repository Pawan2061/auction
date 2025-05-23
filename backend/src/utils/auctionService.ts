import { client } from "../db/redis";
import Auction from "../models/auction";
import Bid from "../models/bid";
import User from "../models/user";

export class AuctionService {
  static async getHighestBid(auctionId: string): Promise<number | null> {
    try {
      const cachedBid = await client.get(`auction:${auctionId}:highest_bid`);
      if (cachedBid) {
        return parseFloat(cachedBid);
      }

      const highestBid = await Bid.findOne({
        where: { auctionId },
        order: [["amount", "DESC"]],
      });

      const amount = highestBid ? highestBid.amount : null;
      if (amount !== null) {
        await client.setex(
          `auction:${auctionId}:highest_bid`,
          300,
          amount.toString()
        );
      }

      return amount;
    } catch (error) {
      console.error("Error getting highest bid:", error);
      return null;
    }
  }

  static async setHighestBid(
    auctionId: string,
    amount: number,
    bidId: string
  ): Promise<void> {
    try {
      await client.setex(
        `auction:${auctionId}:highest_bid`,
        300,
        amount.toString()
      );
      await client.setex(`auction:${auctionId}:highest_bid_id`, 300, bidId);
    } catch (error) {
      console.error("Error setting highest bid in Redis:", error);
    }
  }

  static async isAuctionActive(auctionId: string): Promise<boolean> {
    try {
      const auction = await Auction.findByPk(auctionId);
      if (!auction) return false;

      const now = new Date();
      const isActive = auction.status === "active" && auction.endTime > now;

      if (!isActive && auction.status === "active") {
        await auction.update({ status: "ended" });
      }

      return isActive;
    } catch (error) {
      console.error("Error checking auction status:", error);
      return false;
    }
  }

  static async getAuctionWithDetails(auctionId: string) {
    try {
      const auction = await Auction.findByPk(auctionId, {
        include: [
          {
            model: User,
            as: "seller",
            attributes: ["id", "username"],
          },
        ],
      });
      console.log(auction, "auction is here");

      if (!auction) return null;

      const highestBid = await this.getHighestBid(auctionId);
      console.log(highestBid, "highest bid is here");

      const currentPrice = highestBid || auction.startingPrice;
      console.log(auction.endTime, "is here also");

      return {
        ...auction.toJSON(),
        currentPrice,
        timeRemaining: Math.max(0, auction.endTime.getTime() - Date.now()),
      };
    } catch (error) {
      console.error("Error getting auction details:", error);
      return null;
    }
  }
}
