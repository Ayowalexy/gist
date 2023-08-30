const Store = require("../models/storeModel");
const User = require("../models/userModel");
const Item = require("../models/itemModel");
const asyncHandler = require("express-async-handler");
const {
  storeSchema,
  itemSchema,
  propertiesSchema,
} = require("../middleswares/schema");
const Property = require("../models/propertiesModel");

const createStore = asyncHandler(async (req, res) => {
  const { error, value } = storeSchema.validate(req.body);
  if (error) throw error.details[0].message;

  const store = await Store.create(value);
  console.log(req.user._id);
  const user = await User.findById(req.user._id);
  user.store = store;
  await user.save();
  res.status(201).json(store);
});

const getStore = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "store",
    populate: {
      path: "items",
    },
  });
  res.status(200).json(user.store);
});

const getStores = asyncHandler(async (req, res) => {
  const stores = await Store.find().populate("items");
  res.status(200).json(stores);
});

const addItem = asyncHandler(async (req, res) => {
  console.log("here");
  try {
    const images = req.files.map((file) => file.path);
    const payload = {
      ...req.body,
      images,
    };

    const { error, value } = itemSchema.validate(payload);
    if (error) throw error.details[0].message;

    const store = await Store.findById(value.storeId).populate("items");

    const hasItem = store.items.some(
      (item) => item.item_name === value.item_name
    );
    if (hasItem)
      throw new Error("Item with name " + value.item_name + " already exists ");
    const item = await Item.create(value);

    store.items.push(item);
    await store.save();

    res.status(201).json(item);
  } catch (err) {
    console.log(err);
  }
});

const updateItem = asyncHandler(async (req, res) => {
  await Item.findByIdAndUpdate({ _id: req.params.id }, { ...req.body });

  res.status(201).json({ success: true });
});

const deleteItem = asyncHandler(async (req, res) => {
  await Store.findByIdAndUpdate(
    { _id: req.params.storeId },
    { $pull: { items: { _id: req.params.itemId } } }
  );
  await Item.findByIdAndDelete(req.params.itemId);
  res.status(201).json({ success: true });
});

const getOneItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.status(200).json(item);
});

const addNewProperty = asyncHandler(async (req, res) => {
  const property_images = req.files.map((file) => file.path);
  

  const payload = {
    ...req.body,
    property_images,
  };
  payload.details = JSON.parse(payload.details)

  const { error, value } = propertiesSchema.validate(payload);
  if (error) throw error.details[0].message;

  const property = await Property.create(value);

  await User.findByIdAndUpdate(
    { _id: req.user._id },
    { $push: { properties: property } }
  );

  res.status(201).json({ success: true });
});

const getAllUserProperties = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("properties");
  res.status(200).json(user.properties);
});

const getOneProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  res.status(200).json(property);
});

const updateProperty = asyncHandler(async (req, res) => {
  await Property.findByIdAndUpdate({ _id: req.params.id }, { ...req.body });
  res.status(201).json({ success: true });
});

const deleteProperty = asyncHandler(async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  await User.findByIdAndUpdate(
    { _id: req.user._id },
    { $pull: { properties: { _id: req.params.id } } }
  );
});

module.exports = {
  createStore,
  getStore,
  getStores,
  addItem,
  updateItem,
  deleteItem,
  getOneItem,
  addNewProperty,
  getAllUserProperties,
  getOneProperty,
  updateProperty,
  deleteProperty,
};
