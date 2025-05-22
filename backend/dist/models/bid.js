"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("../index");
const user_1 = __importDefault(require("./user"));
const auction_1 = __importDefault(require("./auction"));
class Bid extends sequelize_1.Model {
}
Bid.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    amount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize: index_1.sequelize,
    modelName: "Bid",
});
// FK: auctionId
Bid.belongsTo(auction_1.default, { foreignKey: "auctionId", as: "auction" });
auction_1.default.hasMany(Bid, { foreignKey: "auctionId", as: "bids" });
// FK: userId (bidder)
Bid.belongsTo(user_1.default, { foreignKey: "userId", as: "bidder" });
user_1.default.hasMany(Bid, { foreignKey: "userId", as: "bids" });
exports.default = Bid;
