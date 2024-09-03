const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const TemporaryUser = require('../models/temporaryUser')

const { generateOtp, findMissingFields, sendMail, isGiven } = require('../utility/reusable')


let userController = {}

//verification
userController.sendOtpToEmail = async (req, res) => {
  // console.log('user works', res);

  const { email } = req.body
  const requiredField = ["email"]
  const missingFields = findMissingFields(req.body, requiredField)
  if (missingFields !== "") return res.status(400).json({ success: false, message: "Please provide following fields " + missingFields })
  try {
    //generate otp
    const otp = generateOtp()
    // make subject and data for email
    const subject = 'OTP For User Verification - NFT Gallery';
    const html = `<p>please use the following One Time Password (OTP):<p><h3>${otp}</h3><p>OTP's are secret. Therefore, do not disclose this to anyone.</p>`;
    // send email
    const sendEmail = await sendMail(email, subject, html)
    console.log('sendEmail: ', sendEmail)
    //create temporary user
    if (sendEmail) {
      const tempUser = await TemporaryUser.create({
        email: email,
        emailOtp: otp
      })
      console.log(tempUser)
      if (tempUser) {
        // response
        return res.status(200).json({ success: true, otp: otp })
      } else {
        return res.status(500).json({ success: false, message: "Failed to create temporary user" })
      }
    } else {
      return res.status(200).json({ success: false })
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

userController.sendOtpForForgetPassword = async (req, res) => {
  const { email } = req.body
  const requiredField = ["email"]
  const missingFields = findMissingFields(req.body, requiredField)
  if (missingFields !== "") return res.status(400).json({ success: false, message: "Please provide following fields " + missingFields })
  const userExist = await User.findOne({ email })

  if (!userExist) {
    return res.status(422).json({ success: "false", error: "User not found" })
  }
  try {
    //generate otp
    const otp = generateOtp()
    // make subject and data for email
    const subject = 'OTP For User Verification - NFT Gallery';
    const html = `<p>please use the following One Time Password (OTP):<p><h3>${otp}</h3><p>OTP's are secret. Therefore, do not disclose this to anyone.</p>`;
    // send email
    const emailSend = await sendMail(email, subject, html)
    console.log(emailSend);

    if (emailSend) {
      await TemporaryUser.create({
        email: email,
        emailOtp: otp
      })
    } else {
      return res.status(200).json({ success: false })
    }
    // response
    return res.status(200).json(
      { success: true, otp: otp }
    )
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

userController.verifyEmail = async (req, res) => {
  const { email, otp } = req.body
  const requiredField = ["email", "otp"]
  const missingFields = findMissingFields(req.body, requiredField)
  if (missingFields !== "") return res.status(400).json({ success: false, message: "Please provide following fields " + missingFields })
  try {
    const temp_user = await TemporaryUser.findOne({ email: email })
    if (temp_user) {
      if (temp_user.emailOtp == otp) {
        return res.status(200).json({ success: true })
      } else {
        return res.status(200).json({ success: false })
      }
    } else {
      return res.status(404).json({ message: "User not found", success: false })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

//password
userController.changePassword = async (req, res) => {
  const { previousPassword, newPassword, user_id } = req.body
  const requiredField = ["previousPassword", "newPassword", "user_id"]
  const missingFields = findMissingFields(req.body, requiredField)
  if (missingFields !== "") return res.status(400).json({ success: false, message: "Please provide following fields " + missingFields })

  try {
    //find user
    const user = await Users.findOne({ user_id: user_id })
    //compare normal password with hash password
    const compare = await bcrypt.compare(previousPassword, user.password)
    //update password
    if (compare) {
      const hashPassword = await bcrypt.hash(newPassword, 12)
      await Users.updateOne({ user_id: user_id }, { password: hashPassword })
      return res.status(200).json({ success: true, message: "Password changed successfully" })
    } else {
      return res.status(200).json({ success: false, message: "Previous password doesn't match" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

userController.forgotPassword = async (req, res) => {
  const { newPassword, email } = req.body
  const requiredField = ["newPassword", "email"]
  const missingFields = findMissingFields(req.body, requiredField)
  if (missingFields !== "") return res.status(400).json({ success: false, message: "Please provide following fields " + missingFields })
  try {
    const hashPassword = await bcrypt.hash(newPassword, 12)
    const updateResponse = await User.updateOne({ email: email }, { password: hashPassword });
    if (updateResponse.modifiedCount > 0) {
      return res.status(200).json({ sucess: true, message: "Password updated successfully" })
    } else {
      return res.status(404).json({ sucess: false, message: "User not found" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

//User
userController.getUserList = async (req, res) => {
  try {
    const usersCount = await Users.countDocuments()
    let data = await Users.find({}).sort({ createdAt: -1 })
    return res.status(200).json({ userList: data, success: true, count: usersCount })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

userController.updateEmail = async (req, res) => {
  const { user_id, email } = req.body
  const requiredField = ["email", "user_id"]
  const missingFields = findMissingFields(req.body, requiredField)
  if (missingFields !== "") return res.status(400).json({ success: false, message: "Please provide following fields " + missingFields })
  try {
    const user = await Users.findOneAndUpdate({ user_id: user_id }, { email: email }, { returnDocument: "after" })
    if (user) {
      return res.status(200).json({ success: true, message: "User email updated successfully" })
    } else {
      return res.status(404).json({ success: false, message: "User not found" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

userController.updateUserMyProfile = async (req, res) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ success: false, message: 'Token is required for authentication' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token using jwt.verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from the decoded token
    const user = await User.findOne({ _id: decoded.user.id });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user details
    const updatedData = req.body; // Assuming the data to update is in the request body
    const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, { new: true });

    // Respond with updated user data
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user_id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        middleName: updatedUser.middleName,
        lastName: updatedUser.lastName,
        dob: updatedUser.dob,
        mobileNumber: updatedUser.mobileNumber,
        status: updatedUser.status,
        token: updatedUser.token, // Optional
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
}

userController.deleteUser = async (req, res) => {
  const { user_id } = req.body
  if (!user_id) {
    return res.status(422).json({ error: "Please fill all the details." })
  }
  try {
    let data = await Users.deleteOne({ user_id })
    let subscription = await userSubscriptions.deleteOne({ user_id })
    if (data.acknowledged && subscription.acknowledged) {
      return res.status(200).json({ msg: "User has been deleted Successfully", success: true })
    } else {
      return res.status(500).json({ error: "Error in deleting User", success: false })
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

// Contact us
userController.addContactUs = async (req, res) => {
  const { fullName, email, message } = req.body
  const requiredField = ["email", "fullName", "message"]
  const missingFields = findMissingFields(req.body, requiredField)
  if (missingFields !== "") return res.status(400).json({ success: false, message: "Please provide following fields " + missingFields })
  try {
    ContactUs.insert({ fullName: fullName, email: email, message: message }).then(data => {
      return res.status(200).json({ msg: "added Successfully", success: true })
    }, err => {
      return res.status(500).json({ msg: "failed", success: false })
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

//register and login and logout

userController.registerUser = async (req, res) => {
  const { firstName, middleName, lastName, dob, email, mobileNumber, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      firstName,
      middleName,
      lastName,
      dob,
      email,
      mobileNumber,
      password: hashedPassword,
    });

    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${user.emailVerifyOTP}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User registered successfully'});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

userController.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Save the token in the user model
    user.token = token;
    await user.save();

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

userController.logout = async (req, res) => {
  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ success: false, message: "Please provide user_id" })
  try {
    // logout user by setting null to token
    await Users.updateOne({ user_id }, { token: null }).then(() => {
      return res.status(200).json({ success: true, message: "User logged out successfully" })
    }).catch((error) => {
      console.log(error)
      return res.status(500).json({ success: false, message: "User not logged out something went wrong" })
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
  }
}

userController.getUser = async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists and is properly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ success: false, message: 'Token is required for authentication' });
    }

    const token = authHeader.split(' ')[1];
    console.log("Token received:", token);

    // Verify the token using jwt.verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECode=>",decoded);

    // Find the user by ID from the decoded token
    const user = await User.findOne({ _id: decoded.user.id });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Respond with user data
    return res.status(200).json({
      success: true,
      message: 'User data retrieved successfully',
      data: {
        user_id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        dob: user.dob,
        email: user.email,
        mobileNumber: user.mobileNumber,
        status: user.status,
        // token: user.token, // Optional, only include if necessary
      },
    });
  } catch (error) {
    console.error("Error in getUser:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

module.exports = userController;
