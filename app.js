const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");
const sequelize = require("./util/database");

const app = express();
const userSignUp = require("./route/user");
const expenseRoute = require("./route/expense");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expenseRoute);

app.use(userSignUp);

sequelize
  .sync()
  .then((result) => {
    console.log("server running");
    app.listen(4000);
  })
  .catch((err) => {
    console.log(err);
  });
