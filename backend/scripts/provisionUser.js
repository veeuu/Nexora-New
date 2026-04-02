#!/usr/bin/env node
// Run from backend/ directory
//node scripts/provisionUser.js "Test User" "email@gmail.com"

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/pgdb');
const PgUser = require('../models/PgUser');
const { sendTrialAccessEmail } = require('../config/email');

const [,, fullName, email] = process.argv;

if (!fullName || !email) {
  console.error('Usage: node scripts/provisionUser.js "Full Name" "email@company.com"');
  process.exit(1);
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ DB connected');

    const existing = await PgUser.findOne({ where: { email } });
    if (existing) {
      console.error(`✗ User already exists: ${email}`);
      process.exit(1);
    }

    // Generate temp password
    const digits = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `${fullName.split(' ')[0]}@${digits}!`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    await PgUser.create({
      email,
      fullName,
      password: hashedPassword,
      isVerified: true,
      otp: null,
      otpExpiry: null
    });

    console.log(`✓ User created: ${email}`);
    console.log(`  Temp password: ${tempPassword}`);

    await sendTrialAccessEmail(email, fullName, tempPassword);
    console.log(`✓ Credentials email sent to ${email}`);

    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
})();
