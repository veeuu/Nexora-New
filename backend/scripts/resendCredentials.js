#!/usr/bin/env node
// Resets password and resends credentials email to an existing user
// Usage: node scripts/resendCredentials.js "email@company.com"
// Run from backend/ directory

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/pgdb');
const PgUser = require('../models/PgUser');
const { sendTrialAccessEmail } = require('../config/email');

const [,, email] = process.argv;

if (!email) {
  console.error('Usage: node scripts/resendCredentials.js "email@company.com"');
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

    // Generate new temp password
    const firstName = user.fullName ? user.fullName.split(' ')[0] : 'User';
    const digits = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `${firstName}@${digits}!`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    await user.update({ password: hashedPassword, isVerified: true, mustChangePassword: true });

    console.log(`✓ Password reset for: ${email}`);
    console.log(`  New temp password: ${tempPassword}`);
    console.log(`  Plan: ${user.plan}`);

    await sendTrialAccessEmail(email, user.fullName, tempPassword);
    console.log(`✓ Credentials email sent to ${email}`);

    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
})();
