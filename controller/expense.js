const Expense = require("../model/expense");
const User = require("../model/user");
const sequelize = require("../util/database");
const FileHistory = require("../model/fileDownload");
const AWS = require("aws-sdk");
const { where } = require("sequelize");

function uploadToS3(data, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET_ID = process.env.IAM_USER_SECRET_ID;

  //creating s3 instance
  let s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET_ID,
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };
  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3Response) => {
      if (err) {
        console.log("Something Went Wrong in Upload", err);
        reject(err);
      } else {
        resolve(s3Response.Location);
      }
    });
  });
}
exports.downloadExpenseFile = async (req, res, next) => {
  try {
    console.log("in download");

    const expenses = await await Expense.findAll({
      where: { userId: req.user.id },
    });
    console.log(expenses);
    //this array we have to convert into string
    const stringifiedExpenses = JSON.stringify(expenses);
    //depending on user and date we want to upload file
    const fileName = `ExpenseData_${req.user.id}/${new Date()}.txt`;
    //once we upload file to s3 we will get file url from s3
    const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
    const data = {
      fileUrl: fileUrl,
      userId: req.user.id,
    };
    const addFileInDb = await FileHistory.create(data);
    console.log(addFileInDb);
    res.status(201).json({ fileUrl: fileUrl, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ fileUrl: "", success: false, err: err });
  }
};

exports.getLeaderBoard = async (req, res, next) => {
  try {
    const userData = await sequelize.query(
      "select name,totalExpense from full_expense.users;"
    );
    console.log(userData[0]);
    res.status(201).json({ userData: userData[0] });
  } catch (err) {
    console.log(err);
  }
};
exports.getExpense = async (req, res, next) => {
  try {
    console.log("getExpense");

    const user = await User.findOne({ where: { id: req.user.id } });
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    const fileHistory = await FileHistory.findAll({
      attributes: ["fileUrl"],
      where: { userId: req.user.id },
    });
    if (user.isPremiumUser === true) {
      res.status(201).json({
        isPremiumUser: true,
        expenses: expenses,
        fileHistory: fileHistory,
      });
    } else {
      res.status(201).json({ isPremiumUser: false, expenses: expenses });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.addExpense = async (req, res, next) => {
  try {
    //console.log("addExpense");

    const expenseAmount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;

    if (expenseAmount === "" || description === "" || category === "") {
      throw new Error("All Fields are required");
    } else {
      const expenseData = await Expense.create({
        amount: expenseAmount,
        description: description,
        category: category,
        userId: req.user.id,
      });
      const updatedTotalExpense =
        Number(req.user.totalExpense) + Number(expenseAmount);
      console.log(updatedTotalExpense);
      User.update(
        { totalExpense: updatedTotalExpense },
        { where: { id: req.user.id } }
      );

      res
        .status(201)
        .json({ message: "expense Data Added", data: expenseData });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    console.log("in delete");
    const expense = await Expense.findOne({ where: { id: req.params.id } });
    if (!expense) {
      throw new Error("Expense Not Found");
    } else {
      const updatedTotalExpense =
        Number(req.user.totalExpense) - Number(expense.amount);

      console.log(updatedTotalExpense);
      User.update(
        { totalExpense: updatedTotalExpense },
        { where: { id: req.user.id } }
      );
      await expense.destroy();
      res.status(200).json({ message: "expense deleted" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.get404 = (req, res, next) => {
  res.status(404).render("404", { pageTitle: "Page Not Found", path: "/404" });
};
