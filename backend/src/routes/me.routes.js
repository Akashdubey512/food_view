const router = require('express').Router();
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const foodPartnerModel = require('../models/foodpartner.model');

router.get('/', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ account: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'user') {
      const user = await userModel.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(200).json({ account: null });
      }
      return res.status(200).json({
        account: {
          _id: user._id,
          role: 'user',
          fullName: user.fullName,
          email: user.email,
        },
      });
    }

    if (decoded.role === 'foodPartner') {
      const foodPartner = await foodPartnerModel.findById(decoded.id).select('-password');
      if (!foodPartner) {
        return res.status(200).json({ account: null });
      }
      return res.status(200).json({
        account: {
          _id: foodPartner._id,
          role: 'foodPartner',
          fullName: foodPartner.fullName,
          email: foodPartner.email,
          bussinessName: foodPartner.bussinessName,
          phoneNumber: foodPartner.phoneNumber,
          address: foodPartner.address,
        },
      });
    }

    return res.status(200).json({ account: null });
  } catch (err) {
    return res.status(200).json({ account: null });
  }
});

module.exports = router;
