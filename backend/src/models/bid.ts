import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/seq";
import User from "./user";
import Auction from "./auction";

export enum BidStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

class Bid extends Model {
  public id!: string;
  public amount!: number;
  public auctionId!: string;
  public userId!: string;
  public status!: BidStatus;
  public acceptedAt!: Date | null;
  public rejectedAt!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  public bidder?: User;
  public auction?: Auction;
}

Bid.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    auctionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Auction,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BidStatus)),
      allowNull: false,
      defaultValue: BidStatus.PENDING,
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Bid",
    tableName: "bids",
    timestamps: true,
  }
);

Bid.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });
Auction.hasMany(Bid, { foreignKey: "auctionId", as: "bids" });

Bid.belongsTo(User, { foreignKey: "userId", as: "bidder" });
User.hasMany(Bid, { foreignKey: "userId", as: "bids" });

export default Bid;
