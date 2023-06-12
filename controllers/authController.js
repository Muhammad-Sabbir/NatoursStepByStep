const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  //https://github.com/auth0/node-jsonwebtoken

  const newUser = await User.create(req.body);
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  //https://jwt.io/
  // JWT DEBUG
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
