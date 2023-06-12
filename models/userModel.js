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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
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
  // delete the password confirm field.
  this.passwordConfirm = undefined; // It's required to actually be persisted to the database, we need this only in validation tests.
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
