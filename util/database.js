const Sequelize = require("sequelize");
const sequelize = new Sequelize("full_expense", "root", "root", {
  host: "localhost",
  dialect: "mysql",
});
module.exports = sequelize;
