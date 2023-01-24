const Expense = require("../model/expense");

exports.getExpense = async (req, res, next) => {
  console.log("getExpense");
  await Expense.findAll({ where: { userId: req.user.id } })
    .then((expenses) => {
      res.status(200).json({ expenses: expenses });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addExpense = async (req, res, next) => {
  try {
    //console.log("addExpense");
    console.log("sdsadqewq" + req.user.id);
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
