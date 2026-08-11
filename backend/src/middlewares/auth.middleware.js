const jwt = require("jsonwebtoken");

function authFoodPartnerMiddleware(req, res, next) {
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

    req.account = {
      role: 'foodPartner',
      data: { _id: decoded.id },
    };
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
}

function authUserMiddleware(req, res, next) {
  const authStart = process.hrtime.bigint();
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

    req.user = { _id: decoded.id };
    req.account = {
      role: 'user',
      data: { _id: decoded.id },
    };
    req._authTimeMs = Number(process.hrtime.bigint() - authStart) / 1e6;
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
function authAnyMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'user') {
      req.user = { _id: decoded.id };
      req.account = { role: 'user', data: { _id: decoded.id } };
    } else if (decoded.role === 'foodPartner') {
      req.account = { role: 'foodPartner', data: { _id: decoded.id } };
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

