import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/seq";
import User from "./user";
import Auction from "./auction";

class Bid extends Model {
  public id!: string;
  public amount!: number;
  public auctionId!: string;
  public userId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public bidder!: string;
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
