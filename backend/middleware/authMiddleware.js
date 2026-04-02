const jwt = require('jsonwebtoken');
const PgUser = require('../models/PgUser');

// Verifies JWT and attaches req.user = { userId, email, plan }
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_change_in_production');

    // Fetch fresh plan from DB (so plan changes take effect immediately)
    const user = await PgUser.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'plan', 'isVerified']
    });

    if (!user) return res.status(401).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(401).json({ message: 'Email not verified' });

    req.user = {
      userId: user.id,
      email: user.email,
      plan: user.plan || 'free_trial'
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
