const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FicheTravauxActe = sequelize.define("FicheTravauxActe", {
  idWorkSheet: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  idProcedure: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "FicheTravauxActe",
  timestamps: false
});

module.exports = FicheTravauxActe;