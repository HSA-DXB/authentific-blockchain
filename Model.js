const mongoose = require("mongoose");
const moment = require("moment");
const binanceSchema = mongoose.Schema(
  {
    transaction: {
      blockHash: { type: "string" },
      blockNumber: { type: "number" },
      contractAddress: { type: "string" },
      cumulativeGasUsed: { type: "number" },
      from: { type: "string" },
      gasUsed: { type: "number" },
      status: { type: "string" },
      to: { type: "string" },
      transactionHash: { type: "string" },
      transactionIndex: { type: "number" },
      type: { type: "string" },
    },
    fileName: {
      type: "string",
      required: false,
    },
    userId: {
      type: "string",
      required: true,
    },
    documentHolderName: {
      type: "string",
    },
    issueDate: {
      type: "date",
    },
    expireDate: {
      type: "date",
    },
    refNo: {
      type: "string",
    },
    fileSize: {
      type: "number",
    },

    mainFileId: {
      type: "string",
      required: false,
      unique: true,
    },
    hash: {
      type: "string",
    },
    totalVerificationCount: {
      type: "number",
      default: 0,
    },
    createdAt: {
      type: String,
      default: new Date().toISOString(),
    },
  },

  {
    timestamp: true,
  }
);

module.exports = Binance = mongoose.model("binance", binanceSchema);
