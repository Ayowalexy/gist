const express = require('express');
const router = express.Router();
const { protect, isHandyMan, isCustomer } = require('../middleswares/authMiddlewares')
const {
        addInformation,
        addServiceCharge,
        updateHandymanPortfolio,
        getProfileInformation,
        bookmark,
        getAllBookmarks
} = require('../controllers/profileInformation');
const {
        getAllHandyman,
        filterHandyMan,
        hireHandyMan,
        createNotification,
        getAllNotification,
        cancelHandyManHire,
        getAllCustomerHires,
        getOneHireDetails,
        updatehandyManWorkHour
} = require('../controllers/userRoutes')

router.route('/profile/:id')
        .put(addInformation)
        .patch(protect, isHandyMan, updateHandymanPortfolio)
        .get(protect, getProfileInformation)

router.route('/handyman')
        .get(protect, getAllHandyman)

router.route('/handyman/:id')
        .patch(protect, isHandyMan, cancelHandyManHire)

router.route('/filter').get(protect, filterHandyMan)
router.route('/hire')
        .post(protect, isCustomer, hireHandyMan)
        .get(protect, isCustomer, getAllCustomerHires)

router.route('/bookmark')
        .post(protect, bookmark)
        .get(protect, getAllBookmarks)

router.route('/hire/:id')
        .get(protect, getOneHireDetails)
        .patch(protect, updatehandyManWorkHour)

router.route('/notification')
        .post(protect, createNotification)
        .get(protect, getAllNotification)

router.route('/service-charge')
        .put(protect, isHandyMan, addServiceCharge)


module.exports = router