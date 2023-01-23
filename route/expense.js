const express = require("express");
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const jsonparser = bodyParser.json();

const expenseController = require("../controller/expense");

//onreload
router.get("/user/expense/getExpense", expenseController.getExpense);
router.post(
  "/user/expense/addExpense",
  jsonparser,
  expenseController.addExpense
);
router.delete(
  "/user/expense/deleteExpense/:id",
  jsonparser,
  expenseController.deleteExpense
);

module.exports = router;
