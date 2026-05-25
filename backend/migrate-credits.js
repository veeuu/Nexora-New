require('dotenv').config();
const { sequelize } = require('./config/pgdb');

sequelize.authenticate().then(() => {
  return sequelize.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "creditsBySection" JSONB NOT NULL DEFAULT '{"technographics":0,"renewal":0,"intent":0,"ntp":0,"buyingGroup":0}'::jsonb;
  `);
}).then(() => {
  console.log('Credits columns added successfully');
  process.exit(0);
}).catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
