const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_SCHEMA_NAME,
  process.env.SCHEMA_USER_NAME,
  process.env.SCEHMA_USER_PWD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);
module.exports = sequelize;
