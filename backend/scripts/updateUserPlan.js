#!/usr/bin/env node
// Usage: node scripts/updateUserPlan.js "email@company.com" paid
// Run from backend/ directory

require('dotenv').config();
const { sequelize } = require('../config/pgdb');
const PgUser = require('../models/PgUser');

const [,, email, plan] = process.argv;

if (!email || !['paid', 'free_trial'].includes(plan)) {
  console.error('Usage: node scripts/updateUserPlan.js "email@company.com" paid|free_trial');
  process.exit(1);
}

(async () => {
  try {
    await sequelize.authenticate();
    await PgUser.sync({ alter: true });

    const user = await PgUser.findOne({ where: { email } });
    if (!user) {
      console.error(`✗ User not found: ${email}`);
      process.exit(1);
    }

    await user.update({ plan });
    console.log(`✓ Updated ${email} → plan: ${plan}`);
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
})();
