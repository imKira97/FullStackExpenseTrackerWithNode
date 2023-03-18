const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const FileHistory = sequelize.define("fileHistory", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fileUrl: { type: Sequelize.STRING, allowNull: false },
});

module.exports = FileHistory;
