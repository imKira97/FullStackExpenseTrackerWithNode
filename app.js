require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");
const fs = require("fs");

//helmet and compression
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

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
const FileHistory = require("./model/fileDownload");

const app = express();

app.use(cors());
app.use(express.json());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

//helmet  compression and morgan
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream })); //morgan will log everything into our file

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

User.hasMany(FileHistory);
FileHistory.belongsTo(User);

sequelize
  .sync()
  .then((result) => {
    console.log("server running");
    app.listen(process.env.PORT_NUMBER);
  })
  .catch((err) => {
    console.log(err);
  });
