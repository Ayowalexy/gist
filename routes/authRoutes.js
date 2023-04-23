const express = require('express');
const router = express.Router();
const { 
    createAccount,
    login,
    getPasswordResetToken,
    verifyOtp,
    resetPassword,
    updateProfile
 } = require('../controllers/authControllers');
const { protect } = require('../middleswares/authMiddlewares.js');


router.route('/signup').post(createAccount);
router.route('/login').post(login);
router.route('/reset').post(getPasswordResetToken)
router.route('/reset-password').patch(resetPassword)
router.route('/verify-otp').post(verifyOtp)
router.route('/update-profile').post(protect, updateProfile)



module.exports = router