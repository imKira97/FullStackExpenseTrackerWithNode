const express = require("express");
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const jsonparser = bodyParser.json();

const purchaseController = require("../controller/purchase");
const authUser = require("../middleware/auth");

router.get(
  "/user/purchase/premiumMember",
  authUser.authenticate,
  purchaseController.purchasePremium
);
router.post(
  "/user/purchase/updateTranscationStatus",
  jsonparser,
  authUser.authenticate,
  purchaseController.updateTranscation
);

module.exports = router;
