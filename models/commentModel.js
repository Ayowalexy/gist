const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Replies = require("./repliesSchema");

const commentSchema = new Schema(
  {
    comment: String,
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    likes: {
      default: 0,
      type: Number,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "replies",
      },
    ],
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comment", commentSchema);
