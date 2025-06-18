const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletAdminSchema = new Schema({
  current_balance: {
    type: Number,
    default: 0,
  },
  total_earning: {
    type: Number,
    default: 0,
  },
  cash_in: {
    type: Number,
    default: 0,
  },
  cash_out: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("WalletAdmin", WalletAdminSchema);
