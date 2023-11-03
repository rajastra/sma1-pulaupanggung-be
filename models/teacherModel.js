const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Teacher = sequelize.define(
  'Teacher',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nip: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

// create example payload
// {
//   "nip": "1234567890",
//   "email": "teacher@teacher",
//   "name": "Teacher",
//   "address": "Teacher Address",
//   "phone_number": "081234567890"
// }

module.exports = Teacher;
