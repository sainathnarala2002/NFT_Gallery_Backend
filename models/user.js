const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  emailVerifyOTP: { type: String },
  emailVerified: { type: Boolean, default: true },
  mobileNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
