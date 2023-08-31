const express = require("express");
const router = express.Router();
const {
  createStore,
  getStore,
  getStores,
  addItem,
  updateItem,
  deleteItem,
  getOneItem,
  getAllUserProperties,
  addNewProperty,
  updateProperty,
  deleteProperty,
  getOneProperty
} = require("../controllers/storeController");
const multer = require("multer");
const { storage } = require("../cloudinary");

const upload = multer({ storage: storage });

const { protect } = require("../middleswares/authMiddlewares");

router.route("/").post(protect, createStore).get(protect, getStores);

router.route("/item").post(protect, upload.array("images"), addItem);

router.route("/single/:id").get(protect, getOneItem);

router.route("/item/:id").get(protect, getStore).patch(protect, updateItem);

router.route("/item/:storeId/:itemId").delete(protect, deleteItem);

router
  .route("/property")
  .get(protect, getAllUserProperties)
  .post(protect, upload.array("property_images"), addNewProperty);

router
  .route("/property/:id")
  .patch(protect, updateProperty)
  .delete(protect, deleteProperty)
  .get(protect, getOneProperty)



module.exports = router;
