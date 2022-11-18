const express = require('express');
const router = express.Router();
const { 
    createAccount,
    login,
    getPasswordResetToken,
    verifyOtp,
    resetPassword
 } = require('../controllers/authControllers')


router.route('/signup').post(createAccount);
router.route('/login').post(login);
router.route('/reset').post(getPasswordResetToken)
router.route('/reset-password').patch(resetPassword)
router.route('/verify-otp').post(verifyOtp)



module.exports = router