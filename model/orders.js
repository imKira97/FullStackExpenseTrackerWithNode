const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  //on successfull payment we will get paymentId
  paymentid: Sequelize.STRING,
  //when user click on buyPremium orderID gets created
  orderid: Sequelize.STRING,

  status: Sequelize.STRING,
});
module.exports = Order;
