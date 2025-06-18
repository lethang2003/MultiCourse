const Payment = require("../Models/Payment.js");
const Wallet = require("../Models/Wallet");
const Order = require("../Models/Orders");
const Cart = require("../Models/Cart");
const Course = require("../Models/Courses");
const PayOS = require("../Configurations/PayOS");
const WalletAdmin = require("../Models/WalletAdmin");

exports.createPayment = async (req, res) => {
  try {
    const user_id = req.user._id;
    const amount = req.body.amount;

    const wallet = await Wallet.findOne({ user: user_id });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const orderCode = Date.now();
    const payment_description = `Payment for order ${orderCode}`;
    const newPayment = await Payment.create({
      order_code: orderCode,
      user: user_id,
      wallet: wallet._id,
      payment_status: "Pending",
      description: payment_description,
      payment_amount: amount,
    });

    wallet.payment_code = orderCode;
    await wallet.save();

    const body = {
      orderCode: orderCode,
      amount: newPayment.payment_amount,
      description: orderCode,
      cancelUrl: `http://localhost:3000/api/payment/check-payment/${orderCode}`,
      returnUrl: `http://localhost:3000/api/payment/check-payment/${orderCode}`,
      // cancelUrl: `http://localhost:3001/cancel?orderCode=${orderCode}&status=CANCELLED`,
      // returnUrl: `http://localhost:3001/success?orderCode=${orderCode}&status=SUCCESS`,
    };

    const paymentLinkRes = await PayOS.createPaymentLink(body);

    res.status(200).end(paymentLinkRes.checkoutUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkPayment = async (req, res) => {
  try {
    const orderCode = req.params.orderCode;
    const status = req.query.status;
    const payment = await Payment.findOne({
      order_code: orderCode,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.payment_status !== "Pending") {
      // return res.status(400).json({ message: "Payment already processed" });
      return res.redirect("http://localhost:3001/course-list");
    }

    if (status === "PAID") {
      payment.payment_status = "Paid";
      await payment.save();
      const wallet = await Wallet.findOne({ payment_code: orderCode });
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      wallet.current_balance += payment.payment_amount;
      wallet.total_deposit += payment.payment_amount;
      wallet.payment_code = undefined;
      await wallet.save();

      const walletAdmin = await WalletAdmin.findOne();
      if (!walletAdmin) {
        walletAdmin = await WalletAdmin.create({
          cash_in: payment.payment_amount,
          current_balance: payment.payment_amount,
        });
      } else {
        walletAdmin.cash_in += payment.payment_amount;
        walletAdmin.current_balance += payment.payment_amount;
        await walletAdmin.save();
      }
      // return res.status(200).json({ message: "Payment successful" });
      return res.redirect("http://localhost:3001/course-list");
    }

    if (status === "CANCELLED") {
      payment.payment_status = "Cancelled";
      await payment.save();
      const wallet = await Wallet.findOne({ payment_code: orderCode });
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      wallet.payment_code = undefined;
      await wallet.save();
      // return res.status(200).json({ message: "Payment cancelled" });
      return res.redirect("http://localhost:3001/course-list");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
