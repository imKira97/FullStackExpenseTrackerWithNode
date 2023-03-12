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

exports.fileHistory = async (req, res, next) => {
  try {
    const fileHistory = await FileHistory.findAll({
      attributes: ["fileUrl"],
      where: { userId: req.user.id },
    });
    res.status(200).json({ fileHistory: fileHistory });
  } catch (err) {
    res.status(400).json({ message: "something went wrong" });
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    //for the first time it will be 5 than it will change
    let expense_per_page = Number(req.query.perPage) || 5;
    console.log("per page" + expense_per_page);

    //Error
    if (page < 1) {
      res.status(400).json({ message: "page Not Found" });
    }
    //count no.of expenses
    const totalExpenseCount = await Expense.count({
      where: { userId: req.user.id },
    });

    const totalPage = Math.ceil(totalExpenseCount / expense_per_page);

    //user ISPremium
    const user = await User.findOne({ where: { id: req.user.id } });
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      offset: (page - 1) * expense_per_page,
      limit: expense_per_page,
    });
    if (user.isPremiumUser === true) {
      res.status(201).json({
        isPremiumUser: true,
        expenses: expenses,
        totalItems: totalExpenseCount,
        currentPage: page,
        hasNextPage: expense_per_page * page < totalExpenseCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: totalPage,
        totalPages: totalPage,
        per_page: expense_per_page,
      });
    } else {
      res.status(201).json({
        isPremiumUser: false,
        expenses: expenses,
        totalItems: totalExpenseCount,
        currentPage: page,
        hasNextPage: expense_per_page * page < totalExpenseCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: totalPage,
        totalPages: totalPage,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.addExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    //console.log("addExpense");

    /*
    We will sequelize transcation to handler error when we are adding,updating or deleting data 
    
    */

    const expenseAmount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;

    //transcation object
    if (expenseAmount === "" || description === "" || category === "") {
      throw new Error("All Fields are required");
    } else {
      const expenseData = await Expense.create(
        {
          amount: expenseAmount,
          description: description,
          category: category,
          userId: req.user.id,
        },
        { transaction: t }
      );
      const updatedTotalExpense =
        Number(req.user.totalExpense) + Number(expenseAmount);
      console.log(updatedTotalExpense);
      await User.update(
        { totalExpense: updatedTotalExpense },
        { where: { id: req.user.id }, transaction: t }
      );
      await t.commit();
      return res
        .status(201)
        .json({ message: "expense Data Added", data: expenseData });
    }
  } catch (err) {
    await t.rollback();
    return res.status(400).json({ message: err.message });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    console.log("in delete");
    const t = await sequelize.transaction();
    const expense = await Expense.findOne({
      where: { id: req.params.id },
      transaction: t,
    });
    if (!expense) {
      throw new Error("Expense Not Found");
    } else {
      const updatedTotalExpense =
        Number(req.user.totalExpense) - Number(expense.amount);
      User.update(
        { totalExpense: updatedTotalExpense },
        { where: { id: req.user.id }, transaction: t }
      );
      await expense.destroy();
      await t.commit();
      return res.status(200).json({ message: "expense deleted" });
    }
  } catch (err) {
    console.log(err);
    await t.rollback();
    return res.status(501).json({ message: "something went wrong" });
  }
};

exports.get404 = (req, res, next) => {
  res.status(404).render("404", { pageTitle: "Page Not Found", path: "/404" });
};
