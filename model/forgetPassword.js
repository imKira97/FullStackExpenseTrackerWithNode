const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const { v4: uuidv4 } = require("uuid");

const ForgetPassword = sequelize.define("forgetPassword", {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true,
  },
  active: {
    type: Sequelize.BOOLEAN,
  },
  expiresby: Sequelize.DATE,
});
module.exports = ForgetPassword;
