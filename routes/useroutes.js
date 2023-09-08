const express = require("express");
const router = express.Router();
const {
  protect,
  isHandyMan,
  isCustomer,
} = require("../middleswares/authMiddlewares");
const {
  addInformation,
  addServiceCharge,
  updateHandymanPortfolio,
  getProfileInformation,
  bookmark,
  getAllBookmarks,
  addImages,
} = require("../controllers/profileInformation");
const {
  getAllHandyman,
  filterHandyMan,
  hireHandyMan,
  createNotification,
  getAllNotification,
  cancelHandyManHire,
  getAllCustomerHires,
  getOneHireDetails,
  updatehandyManWorkHour,
  getOneHandyManDetails,
  getAllHandymanHires,
  addUserToContact,
  getAllContact,
  notifyUser,
} = require("../controllers/userRoutes");

router
  .route("/profile/:id")
  .put(addInformation)
  .patch(protect, isHandyMan, updateHandymanPortfolio)
  .get(protect, getProfileInformation);

router.route("/images/:id").patch(protect, isHandyMan, addImages);

router.route("/handyman").get(protect, getAllHandyman);

router.route("/get-one-handyman/:id").get(protect, getOneHandyManDetails);

router.route("/handyman/:id").patch(protect, isHandyMan, cancelHandyManHire);

router.route("/filter").get(protect, filterHandyMan);
router
  .route("/hire")
  .post(protect, isCustomer, hireHandyMan)
  .get(protect, isCustomer, getAllCustomerHires);

router
  .route("/all-handyman-hire")
  .get(protect, isHandyMan, getAllHandymanHires);

router.route("/bookmark").post(protect, bookmark).get(protect, getAllBookmarks);

router
  .route("/hire/:id")
  .get(protect, getOneHireDetails)
  .patch(protect, updatehandyManWorkHour);

router
  .route("/notification")
  .post(protect, createNotification)
  .get(protect, getAllNotification);

router.route("/service-charge/:id").put(addServiceCharge);

router.route("/notify-user").post(protect, notifyUser);

router
  .route("/messaage/contact")
  .get(protect, getAllContact)
  .post(protect, addUserToContact);

module.exports = router;
