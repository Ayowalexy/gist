const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

const propertiesSchema = new Schema(
  {
    property_name: {
      type: String,
      required: true,
      unique: true,
    },
    property_description: {
      type: String,
      required: true,
    },
    property_price: {
      type: Number,
      required: true,
    },
    property_location: {
      type: String,
      required: true,
    },
    property_rate: {
      type: String,
      required: true,
      enum: ["annum", "monthly", "quarterly", "weekly"],
    },
    details: [
      {
        title: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    property_images: [
      {
        type: String,
        required: true,
        min: 1,
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("property", propertiesSchema);

module.exports = Property;
