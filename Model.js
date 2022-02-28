const mongoose = require("mongoose");
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
    blockChainFileId: {
      type: "string",
      required: false,
    },
    mainFileId: {
      type: "string",
      required: false,
    },
    hash: {
      type: "string",
    },
  },

  {
    timestamp: true,
  }
);

module.exports = Binance = mongoose.model("binance", binanceSchema);
