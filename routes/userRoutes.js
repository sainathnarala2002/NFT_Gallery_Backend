const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../utility/authenticate');


const router = express.Router();


// Otp Verification
router.post("/sendOtp", userController.sendOtpToEmail) // sheet
router.post("/verifyEmail", userController.verifyEmail) // sheet
router.post("/sendOtpForForgetPassword", userController.sendOtpForForgetPassword) // sheet
router.post("/ChangePassword", userController.forgotPassword) // sheet

// Register
router.post("/login", userController.loginUser) // sheet
router.post("/register", userController.registerUser) // sheet
router.get("/logout", userController.logout) // sheet

// User
router.get("/getUser", authenticate, userController.getUser) // sheet
router.put("/updateMyProfile", userController.updateUserMyProfile) // sheet


module.exports = router;
