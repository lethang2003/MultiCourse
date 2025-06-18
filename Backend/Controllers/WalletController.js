const Wallet = require("../Models/Wallet");
const Payment = require("../Models/Payment");
const ActivityHistory = require("../Models/ActivityHistory");
const User = require("../Models/Users");
const WalletAdmin = require("../Models/WalletAdmin");
const mongoose = require("mongoose");

// Show số dư tài khoản của user
exports.showBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).select(
      "current_balance"
    );

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.status(200).json({ current_balance: wallet.current_balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Rút tiền
exports.withdrawRequest = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount." });
    }

    // Tìm Wallet của user
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found." });
    }

    // Kiểm tra nếu đã có yêu cầu rút tiền đang chờ xử lý
    const hasPendingRequest = wallet.withdrawals.some(
      (withdrawal) => withdrawal.status === "Pending"
    );

    if (hasPendingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending withdrawal request." });
    }

    if (wallet.current_balance < amount) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Thêm yêu cầu rút tiền vào mảng
    wallet.withdrawals.push({
      amount,
      status: "Pending",
    });

    await wallet.save();

    res.status(200).json({
      message: "Withdrawal request submitted successfully.",
      withdrawals: wallet.withdrawals,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lịch sử rút tiền
exports.withdrawHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).select(
      "withdrawals"
    );

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found." });
    }

    res.status(200).json({ withdrawals: wallet.withdrawals });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Show lệnh rút (Admin)
exports.showAllWithdrawRequests = async (req, res) => {
  try {
    // Tìm tất cả Wallet có yêu cầu rút tiền
    const wallets = await Wallet.find()
      .populate("user", "fullname email phone bankAccount") // Populate thông tin ngân hàng từ User
      .select("withdrawals");

    // Format kết quả
    const pendingRequests = wallets.flatMap((wallet) =>
      wallet.withdrawals.map((withdrawal) => ({
        withdrawal_id: withdrawal._id,
        user: {
          fullname: wallet.user.fullname,
          email: wallet.user.email,
          phone: wallet.user.phone,
        },
        amount: withdrawal.amount,
        date: withdrawal.date,
        bank_account: wallet.user.bankAccount, // Thông tin ngân hàng lấy từ User
        status: withdrawal.status,
      }))
    );

    res.status(200).json({ pendingRequests });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Xác nhận chuyển tiền và trừ tiền vào ví (Admin)
exports.confirmWithdrawRequest = async (req, res) => {
  try {
    const { withdrawalId } = req.body; // Chỉ cần ID của lệnh rút

    const walletAdmin = await WalletAdmin.findOne();

    // Tìm Wallet chứa lệnh rút
    const wallet = await Wallet.findOne({
      "withdrawals._id": new mongoose.Types.ObjectId(withdrawalId),
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const user = await User.findById(wallet.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Tìm lệnh rút trong wallet
    const withdrawal = wallet.withdrawals.id(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status === "Approved") {
      return res
        .status(400)
        .json({ message: "Withdrawal request already completed" });
    }

    // Cập nhật trạng thái lệnh rút và trừ tiền từ ví của user
    withdrawal.status = "Approved";
    wallet.current_balance -= withdrawal.amount; // Trừ tiền vào ví của user
    // Chỉ cộng vào `total_withdrawal` khi lệnh rút được duyệt
    wallet.total_withdrawal =
      (wallet.total_withdrawal || 0) + withdrawal.amount;

    // Cộng tiền vào ví admin
    walletAdmin.cash_out += withdrawal.amount;
    walletAdmin.current_balance -= withdrawal.amount;

    // Lưu lại lịch sử hoạt động của admin
    const newActivity = new ActivityHistory({
      user: req.user._id,
      role: "Admin",
      description: `Approved withdrawal request of ${withdrawal.amount} VND for user ${user.fullname}`,
    });

    await walletAdmin.save();
    await wallet.save();
    await newActivity.save();
    res
      .status(200)
      .json({ message: "Withdrawal request confirmed successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Từ chối lệnh rút (Admin)
exports.rejectWithdrawRequest = async (req, res) => {
  try {
    const { withdrawalId } = req.body; // Chỉ cần ID của lệnh rút

    // Tìm Wallet chứa lệnh rút
    const wallet = await Wallet.findOne({
      "withdrawals._id": new mongoose.Types.ObjectId(withdrawalId),
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const user = await User.findById(wallet.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Tìm lệnh rút trong wallet
    const withdrawal = wallet.withdrawals.id(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status === "Approved") {
      return res
        .status(400)
        .json({ message: "Withdrawal request already completed" });
    }

    // Cập nhật trạng thái lệnh rút
    withdrawal.status = "Rejected";
    const newActivity = new ActivityHistory({
      user: req.user._id,
      role: "Admin",
      description: `Rejected withdrawal request of ${withdrawal.amount} VND for user ${user.fullname}`,
    });

    await wallet.save();
    await newActivity.save();

    res
      .status(200)
      .json({ message: "Withdrawal request rejected successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Show lịch sử nạp tiền vào ví
exports.depositHistory = async (req, res) => {
  try {
    // Tìm ví của user
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Lấy danh sách giao dịch nạp tiền (payment_status: "Paid")
    const deposits = await Payment.find({
      wallet: wallet._id,
      payment_status: "Paid",
    }).select("order_code payment_amount payment_date description");

    res.status(200).json({ deposits });
  } catch (err) {
    console.error("Error fetching deposit history:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.showAdminWallet = async (req, res) => {
  try {
    const walletAdmin = await WalletAdmin.findOne();
    if (!walletAdmin) {
      return res.status(404).json({ message: "Admin wallet not found" });
    }

    res.status(200).json({
      current_balance: walletAdmin.current_balance,
      total_earning: walletAdmin.total_earning,
      cash_in: walletAdmin.cash_in,
      cash_out: walletAdmin.cash_out,
    });
  } catch (err) {
    console.error("Error fetching admin wallet:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all deposit for admin
exports.getAllDepositForAdmin = async (req, res) => {
  try {
    const deposits = await Payment.find({
      payment_status: "Paid",
    })
      .populate({
        path: "wallet",
        select: "user",
        populate: {
          path: "user",
          select: "fullname",
        },
      })
      .select("order_code payment_amount payment_date description");

    const formattedDeposits = deposits.map((deposit) => ({
      order_code: deposit.order_code,
      payment_amount: deposit.payment_amount,
      payment_date: deposit.payment_date,
      description: deposit.description,
      user: deposit.wallet?.user?.fullname || "Unknown User",
    }));

    res.status(200).json({ deposits: formattedDeposits });
  } catch (err) {
    console.error("Error fetching deposits:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
