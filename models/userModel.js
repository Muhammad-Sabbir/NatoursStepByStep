const crypto = require('crypto'); // this is build in node.js package
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// name, email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valide email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false, // this will not show in the output or client side
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //This only works on Create and Save!!
      // when a new user create then this will works only
      // But if any user update his password then this will not work
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  // 17. Deleting the Current User
  active: {
    type: Boolean,
    default: true,
    select: false, // this will not show in the output or client side
  }, // we want to hide this field to the user
});
//password save encription
// we will use pre-save middleware, so basically document middleware
userSchema.pre('save', async function (next) {
  // only run this function if password was actually changed.
  if (!this.isModified('password')) return next();
  //for hashing purposes we will use bcryptjs. hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12); // we need to specify a cost parameter. there is two ways to do this
  //1. first way will to be manually generating the salt that is random string gonna be added to the password. and then here use that salt in this hash function.
  //comment: higher number 12 means strong password. this hash function can be sync and async. we will use async.
  // delete the password confirm field
  this.passwordConfirm = undefined; // It's required to actually be persisted to the database, we need this only in validation tests.
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // some time jwt is created a bit before the changed password timestamp that is why we substract 1000 milliseconds. this is a little hack but this not the problem
  next();
});

//17. Deleting the Current User
userSchema.pre(/^find/, function (next) {
  // here ^find will not only match with the find but also findAll, findOne, findTwo etc.
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // 100<200
  }
  // false means not changed
  return false; // default false
};
userSchema.methods.createPasswordResetToken = function () {
  // password reset token must be in a random string
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken; // this will send user to email
};
const User = mongoose.model('User', userSchema);
module.exports = User;
