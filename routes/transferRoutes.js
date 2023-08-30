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


router.route('/:id')
    .get( getAllBanks)
    .post( verifyBankAccount)

router.route('/complete').patch(protect, isCustomer, payForHandyManHire)
router.route('/fund').post(webhook)
router.route('/add-bank/:id').post(addBankAccount)
router.route('/pay-handyman').post(protect, payHandyman)

module.exports = router