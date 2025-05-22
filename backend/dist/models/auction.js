"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("../index");
const user_1 = __importDefault(require("./user"));
class Auction extends sequelize_1.Model {
}
Auction.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    startingPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    duration: {
        type: sequelize_1.DataTypes.INTEGER, // in seconds
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "ended", "closed"),
        defaultValue: "active",
    },
    highestBidId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
}, {
    sequelize: index_1.sequelize,
    modelName: "Auction",
});
// FK: userId (seller)
Auction.belongsTo(user_1.default, { foreignKey: "userId", as: "seller" });
user_1.default.hasMany(Auction, { foreignKey: "userId", as: "auctions" });
exports.default = Auction;
