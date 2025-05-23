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
  public userId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public endTime!: Date;
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
      comment: "Duration in minutes",
    },
    status: {
      type: DataTypes.ENUM("active", "ended", "closed"),
      defaultValue: "active",
    },
    highestBidId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Auction",
    tableName: "auctions",
    timestamps: true,
    hooks: {
      beforeCreate: (auction: Auction) => {
        const now = new Date();

        auction.endTime = new Date(now.getTime() + auction.duration * 60000);
      },
    },
  }
);

Auction.belongsTo(User, { foreignKey: "userId", as: "seller" });
User.hasMany(Auction, { foreignKey: "userId", as: "auctions" });

export default Auction;
