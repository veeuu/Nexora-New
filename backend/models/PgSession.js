const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/pgdb');
const PgUser = require('./PgUser');

const PgSession = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PgUser,
      key: 'id'
    }
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

PgUser.hasMany(PgSession, { foreignKey: 'userId' });
PgSession.belongsTo(PgUser, { foreignKey: 'userId' });

module.exports = PgSession;
