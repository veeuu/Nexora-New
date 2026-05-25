const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/pgdb');

const PgUser = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    lowercase: true
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  plan: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'free_trial'  // 'free_trial' | 'paid'
  },
  mustChangePassword: {
    type: DataTypes.BOOLEAN,
    defaultValue: false  // set true when provisioned via script
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: true
  },
  otpExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  creditsUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  creditsBySection: {
    type: DataTypes.JSONB,
    defaultValue: { technographics: 0, renewal: 0, intent: 0, ntp: 0, buyingGroup: 0 },
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = PgUser;
