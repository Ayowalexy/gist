const express = require('express');
const router = express.Router();
const { protect, isCustomer } = require('../middleswares/authMiddlewares')
const {
    getAllBanks,
    verifyBankAccount,
    payForHandyManHire
} = require('../controllers/transferControllers');


router.route('/')
    .get(protect, getAllBanks)
    .post(protect, verifyBankAccount)

router.route('/complete').patch(protect, isCustomer, payForHandyManHire)


module.exports = router