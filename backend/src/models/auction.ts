import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/seq";
import User from "./user";

class Auction extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public startingPrice!: number;
  public duration!: number;
  public status!: "active" | "ended" | "closed";
  public highestBidId?: string | null;
}

Auction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startingPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "ended", "closed"),
      defaultValue: "active",
    },
    highestBidId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Auction",
    tableName: "auctions",
    timestamps: true,
  }
);

Auction.belongsTo(User, { foreignKey: "userId", as: "seller" });
User.hasMany(Auction, { foreignKey: "userId", as: "auctions" });

export default Auction;
