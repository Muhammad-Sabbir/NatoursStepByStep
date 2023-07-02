const User = require('../models/userModel');
// eslint-disable-next-line import/no-unresolved
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  //We donst want to send the password to the client
  //query.sort().select().skip().limit() // this is a big query. We can add multiple statements to the query

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: { users },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  // 2) Update user document
  // ex1: here we can not use this process because this process required the password.
  // const user = await User.findById(req.user.id);
  // user.name = 'Jonas';
  // await user.save();

  // Ex2:
  // 2) Filtered out unwanted fields names that are not allowed to be updated.
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined.' });
};
exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined.' });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined.' });
};
exports.deleteUser = factory.deleteOne(User); // Now only the administrator should later be able to actually delete users because remember that when the user deletes himself, then they will not actually get deleted but only active be set to false. (see exports.deleteMe). But the administrator on the other hand is really gonna be able to delete the user effectively from the database.
