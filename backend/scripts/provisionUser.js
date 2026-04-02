#!/usr/bin/env node
// Usage:
//   node scripts/provisionUser.js "Full Name" "email@company.com"              → free_trial
//   node scripts/provisionUser.js "Full Name" "email@company.com" paid         → paid plan
// Run from backend/ directory

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/pgdb');
const PgUser = require('../models/PgUser');
const { sendTrialAccessEmail } = require('../config/email');

const [,, fullName, email, planArg] = process.argv;
const plan = planArg === 'paid' ? 'paid' : 'free_trial';

if (!fullName || !email) {
  console.error('Usage: node scripts/provisionUser.js "Full Name" "email@company.com" [paid|free_trial]');
  process.exit(1);
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ DB connected');

    // Run sync to add plan column if it doesn't exist yet
    await PgUser.sync({ alter: true });
    console.log('✓ Schema synced');

    const existing = await PgUser.findOne({ where: { email } });
    if (existing) {
      // If user exists, just update their plan
      await existing.update({ plan });
      console.log(`✓ Updated existing user ${email} → plan: ${plan}`);
      process.exit(0);
    }

    // Generate temp password: FirstName@4digits!
    const digits = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `${fullName.split(' ')[0]}@${digits}!`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    await PgUser.create({
      email,
      fullName,
      password: hashedPassword,
      plan,
      isVerified: true,
      mustChangePassword: true,
      otp: null,
      otpExpiry: null
    });

    console.log(`✓ User created: ${email}`);
    console.log(`  Plan:          ${plan}`);
    console.log(`  Temp password: ${tempPassword}`);

    await sendTrialAccessEmail(email, fullName, tempPassword);
    console.log(`✓ Credentials email sent to ${email}`);

    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
})();
