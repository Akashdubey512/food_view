const foodPartnerModel = require('../models/foodpartner.model')
const userModel = require('../models/user.model')
const jwt = require("jsonwebtoken");

async function authFoodPartnerMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'foodPartner') {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    const foodPartner = await foodPartnerModel.findById(decoded.id);

    if (!foodPartner) {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }

    req.account = {
      role: 'foodPartner',
      data: foodPartner,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
}

async function authUserMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'user') {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }

    req.user = user;
    req.account = {
      role: 'user',
      data: user,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
}

// Accepts both 'user' and 'foodPartner' roles.
// ⚠️  ONLY use on routes whose controllers do NOT access req.user directly.
//     - For users:       sets req.user AND req.account
//     - For foodPartners: sets req.account ONLY (req.user is undefined)
// Controllers must check req.account.role if they need role-specific logic.
async function authAnyMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'user') {
      const user = await userModel.findById(decoded.id);
      if (!user) return res.status(401).json({ message: 'Invalid token' });
      req.user = user;
      req.account = { role: 'user', data: user };
    } else if (decoded.role === 'foodPartner') {
      const foodPartner = await foodPartnerModel.findById(decoded.id);
      if (!foodPartner) return res.status(401).json({ message: 'Invalid token' });
      req.account = { role: 'foodPartner', data: foodPartner };
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
}

module.exports = {
  authFoodPartnerMiddleware,
  authUserMiddleware,
  authAnyMiddleware,
}
