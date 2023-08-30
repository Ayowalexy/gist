const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    email: {
      type: String,
      unique: true,
      index: true,
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    debitAccount: [
      {
        type: Object,
      },
    ],
    password: String,
    dateOfBirth: Date,
    gender: String,
    state: String,
    city: String,
    location: String,
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    about: String,
    clients: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    total_income: {
      type: Number,
      default: 0,
    },
    total_withdrawal: {
      type: Number,
      default: 0,
    },
    total_balance: {
      type: Number,
      default: 0,
    },
    bank: {
      type: Schema.Types.ObjectId,
      ref: "bank",
    },
    hires: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    bookmarks: [
      {
        type: Object,
      },
    ],
    userImg: {
      type: String,
      default: "",
    },
    experience: {
      type: Number,
      default: 0,
    },
    portfolioImages: [
      {
        type: String,
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "notification",
      },
    ],
    isHandyMan: Boolean,
    rating: {
      type: Number,
      default: 0,
    },
    ratedBy: {
      type: Number,
      default: 0,
    },
    serviceCategory: String,
    serviceCharge: {
      type: Number,
      min: [1, "Service charge too small"],
    },
    otpToken: String,
    canResetPassword: {
      type: Boolean,
      default: false,
    },
    post: [
      {
        type: Schema.Types.ObjectId,
        ref: "post",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "message",
      },
    ],
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
    properties: [
      {
        type: Schema.Types.ObjectId,
        ref: "property",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(uniqueValidator, {
  message: "Error, {VALUE} already exists.",
});

module.exports = mongoose.model("user", userSchema);
