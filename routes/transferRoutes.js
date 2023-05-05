const express = require('express');
const router = express.Router();
const { protect, isCustomer } = require('../middleswares/authMiddlewares')
const {
    getAllBanks,
    verifyBankAccount,
    payForHandyManHire,
    webhook,
    addBankAccount,
    payHandyman
} = require('../controllers/transferControllers');


router.route('/')
    .get(protect, getAllBanks)
    .post(protect, verifyBankAccount)

router.route('/complete').patch(protect, isCustomer, payForHandyManHire)
router.route('/fund').post(webhook)
router.route('/add-bank').post(protect, addBankAccount)
router.route('/pay-handyman').post(protect, payHandyman)

module.exports = router