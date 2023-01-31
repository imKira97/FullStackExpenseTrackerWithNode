const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const { v4: uuidv4 } = require("uuid");

const ForgetPassword = sequelize.define("forgetPassword", {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: uuidv4(),
  },
  status: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});
module.exports = ForgetPassword;
