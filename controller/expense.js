const Expense = require("../model/expense");
const User = require("../model/user");
const sequelize = require("../util/database");

exports.getLeaderBoard = async (req, res, next) => {
  try {
    const userData = await sequelize.query(
      "select SUM(AMOUNT) as total_spend ,name from full_expense.expenses left join full_expense.users  on expenses.userId=users.id GROUP BY userId order by total_spend  desc ;"
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

    if (user.isPremiumUser === true) {
      res.status(201).json({ isPremiumUser: true, expenses: expenses });
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
      console.log("expenseData" + expenseData);
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
