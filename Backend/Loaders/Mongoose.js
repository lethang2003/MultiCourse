var config = require("../Configurations/Config");
const mongoose = require("mongoose");
const WalletAdmin = require("../Models/WalletAdmin");

const url = config.databaseUrl;
const connect = mongoose.connect(url);
connect.then(
  (db) => {
    WalletAdmin.findOne({}).then((wallet) => {
      if (!wallet) {
        WalletAdmin.create({});
      }
    });
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);
