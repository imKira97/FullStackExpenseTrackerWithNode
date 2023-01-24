const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");
const sequelize = require("./util/database");

const app = express();
const userSignUp = require("./route/user");
const expenseRoute = require("./route/expense");

//Model
const Expense = require("./model/expense");
const User = require("./model/user");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expenseRoute);
app.use(userSignUp);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize
  .sync()
  .then((result) => {
    console.log("server running");
    app.listen(4000);
  })
  .catch((err) => {
    console.log(err);
  });
