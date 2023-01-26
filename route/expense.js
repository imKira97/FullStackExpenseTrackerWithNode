const express = require("express");
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const jsonparser = bodyParser.json();

const expenseController = require("../controller/expense");
const authUser = require("../middleware/auth");

//onreload
router.get(
  "/user/Status",
  authUser.authenticate,
  expenseController.getUserStatus
);
router.get(
  "/user/expense/getExpense",
  authUser.authenticate,
  expenseController.getExpense
);

router.post(
  "/user/expense/addExpense",
  jsonparser,
  authUser.authenticate,
  expenseController.addExpense
);
router.delete(
  "/user/expense/deleteExpense/:id",
  authUser.authenticate,
  jsonparser,
  expenseController.deleteExpense
);

module.exports = router;
