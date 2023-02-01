require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");

const sequelize = require("./util/database");
const userSignUp = require("./route/user");
const expenseRoute = require("./route/expense");
const purchaseRoute = require("./route/purchase");
const passwordRoute = require("./route/password");

//Model
const Expense = require("./model/expense");
const User = require("./model/user");
const Order = require("./model/orders");
const ForgetPassword = require("./model/forgetPassword");

const app = express();

app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passwordRoute);
app.use(expenseRoute);
app.use(userSignUp);
app.use(purchaseRoute);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgetPassword);
ForgetPassword.belongsTo(User);

sequelize
  .sync()
  .then((result) => {
    console.log("server running");
    app.listen(4000);
  })
  .catch((err) => {
    console.log(err);
  });
