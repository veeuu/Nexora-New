require('dotenv').config();
const { sequelize } = require('./config/pgdb');

sequelize.authenticate().then(() => {
  return sequelize.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS "revealedRows" JSONB NOT NULL DEFAULT '{"technographics":[],"renewal":[],"intent":[],"ntp":[],"buyingGroup":[],"buyingGroupEmails":[],"buyingGroupMobileDIDs":[],"buyingGroupOrgCharts":[]}'::jsonb;
  `);
}).then(() => {
  console.log('revealedRows column added successfully');
  process.exit(0);
}).catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
