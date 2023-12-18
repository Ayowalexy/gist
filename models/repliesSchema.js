const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const repliesSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
    reply: String
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("replies", repliesSchema);
