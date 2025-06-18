const express = require("express");
const walletController = require("../Controllers/WalletController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.get(
  "/show-balance",
  cors.corsWithOptions,
  auth.verifyUser,
  walletController.showBalance
);

router.post(
  "/withdrawal-request",
  cors.corsWithOptions,
  auth.verifyUser,
  walletController.withdrawRequest
);

router.get(
  "/requests-history",
  cors.corsWithOptions,
  auth.verifyUser,
  walletController.withdrawHistory
);

router.get(
  "/all-withdrawal-requests",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  walletController.showAllWithdrawRequests
);

router.put(
  "/approve-withdrawal-request",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  walletController.confirmWithdrawRequest
);

router.put(
  "/reject-withdrawal-request",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  walletController.rejectWithdrawRequest
);
router.get(
  "/deposit-history",
  cors.corsWithOptions,
  auth.verifyUser,
  walletController.depositHistory
);
router.get(
  "/show-wallet-admin",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  walletController.showAdminWallet
);

router.get(
  "/all-deposit-history",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  walletController.getAllDepositForAdmin
);
module.exports = router;
