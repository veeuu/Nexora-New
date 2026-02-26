const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.PG_DATABASE || 'nexora_auth',
  process.env.PG_USER || 'postgres',
  process.env.PG_PASSWORD || 'postgres',
  {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

const connectPG = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ PostgreSQL Connected successfully');
  } catch (err) {
    console.error('✗ PostgreSQL Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectPG };
