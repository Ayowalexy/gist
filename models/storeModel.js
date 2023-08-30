const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

const storeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
   
  },
  { timestamps: true }
);

storeSchema.plugin(uniqueValidator, {
  message: "Error, {VALUE} already exists.",
});
const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
