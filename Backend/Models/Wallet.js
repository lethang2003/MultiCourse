const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  payment_code: {
    type: String,
    default: undefined,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  current_balance: {
    type: Number,
    default: 0,
  },
  total_earning: {
    //tổng tiền kiếm được
    type: Number,
    default: undefined,
  },
  total_spent: {
    //tiền đã tiêu
    type: Number,
    default: undefined,
  },
  total_deposit: {
    //tiền đã nạp
    type: Number,
    default: undefined,
  },
  total_withdrawal: {
    //tiền đã rút
    type: Number,
    default: 0,
  },
  withdrawals: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
    },
  ],
});

module.exports = mongoose.model("Wallet", WalletSchema);
