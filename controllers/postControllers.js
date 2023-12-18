const Post = require("../models/postModels");
const asyncHandler = require("express-async-handler");
const {
  postSchema,
  commentSchema,
  replySchema,
} = require("../middleswares/schema");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const Reply = require("../models/repliesSchema");
const Notification = require("../models/notificationModel");

const createPost = asyncHandler(async (req, res) => {
  // const { error, value } = postSchema.validate(req.body);

  // if (error) {
  //     return res
  //         .status(401)
  //         .json(
  //             {
  //                 status: "error",
  //                 message: "invalid request",
  //                 meta: {
  //                     error: error.message
  //                 }
  //             })
  // }

  const { _id } = req.user;

  const user = await User.findById({ _id: _id });

  const postImages = req.files?.map((element) => element?.path);

  if (user) {
    const post = new Post({ ...req.body, user, images: postImages });
    await post.save();

    await User.findByIdAndUpdate(
      { _id: _id },
      {
        $push: { post: post },
      }
    );
    return res.status(201).json({
      status: "success",
      message: "post created scuccessfully",
      data: post,
      meta: {},
    });
  } else {
    res.status(404);
    throw new Error(`user with ${_id} does not exist`);
  }
});

const createComment = asyncHandler(async (req, res) => {
  const { error, value } = commentSchema.validate(req.body);

  if (error) {
    return res.status(401).json({
      status: "error",
      message: "invalid request",
      meta: {
        error: error.message,
      },
    });
  }

  const post = await Post.findById({ _id: value.post });

  if (post) {
    const user = await User.findById({ _id: value.user });
    const comment = new Comment(value);
    await comment.save();

    const userNotification = new Notification({
      type: "comment",
      title: `${user?.firstName} ${user?.lastName} commented on your post`,
    });

    userNotification.save();
    user.notifications.push(userNotification);

    await user.save();

    post.comments.push(comment);
    await post.save();
    res.status(201).json({
      status: "success",
      message: "comment created scuccessfully",
      data: comment,
      meta: {},
    });
  }
});

const createReply = asyncHandler(async (req, res) => {
  const { error, value } = replySchema.validate(req.body);

  if (error) {
    return res.status(401).json({
      status: "error",
      message: "invalid request",
      meta: {
        error: error.message,
      },
    });
  }

  const comment = await Comment.findById({ _id: value.comment });
  if (comment) {
    const user = await User.findById({ _id: value.user });
    const reply = new Reply(value);
    await reply.save();
    const notification = new Notification({
      type: "comment",
      title: `${user?.firstName} ${user?.lastName} just replied to your comment`,
    });
    await notification.save();
    user.notifications.push(notification);
    await user.save();
    comment.replies.push(reply);
    await comment.save();
    res.status(201).json({
      status: "success",
      message: "reply created scuccessfully",
      data: reply,
      meta: {},
    });
  }
});

const getAllPost = asyncHandler(async (req, res) => {
  const post = await Post.find()
    .populate({
      path: "comments",
      populate: { path: "replies" },
    })
    .populate({
      path: "user",
      select: "firstName lastName userImg",
    });
  res.status(200).json({
    status: "success",
    data: post,
    meta: {},
  });
});

const getOnePost = asyncHandler(async (req, res) => {
  const post = await Post.findById({ _id: req.params.id })
    .populate({
      path: "comments",
      populate: { path: "replies" },
    })
    .populate({
      path: "user",
      select: "firstName lastName userImg",
    });

  if (post) {
    res.status(200).json({
      status: "success",
      data: post,
      meta: {},
    });
  } else {
    res.json({
      status: "error",
      message: "invalid request",
      meta: { error: `Post with ${req.params.id} does not exist` },
    });
  }
});

const searchPost = asyncHandler(async (req, res) => {
  const term = req.query.name;

  const post = await Post.find({
    name: { $regex: `^${term}$`, $options: "i" },
  });
  res.status(200).json({
    status: "success",
    data: post,
    meta: {},
  });
});

const getAllPostComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.find({ post: id })
    .populate({
      path: "user",
      select: "firstName lastName userImg",
    })
    .populate({
      path: "replies",
      populate: {
        path: "user",
        select: "firstName lastName userImg",
      },
      select: "reply createdAt likedBy",
    });

  if (comment) {
    res.status(200).json({
      status: "success",
      data: comment,
      meta: {},
    });
  } else {
    res.json({
      status: "error",
      message: "invalid request",
      meta: { error: `Post with ${req.params.id} does not exist` },
    });
  }
});

const like = asyncHandler(async (req, res) => {
  const { type, commentId = "", postId = "", replyId = "" } = req.body;
  const { _id } = req.user;


  if (type === "comment") {
    const comment = await Comment.findById({ _id: commentId });
    const hasLikedComment = comment.likedBy.some(
      (ele) => ele.toString() === _id.toString()
    );
    if (hasLikedComment) {
      const likedBy = [...comment.likedBy];
      likedBy.splice(likedBy.indexOf(_id), 1);
      comment.likedBy = likedBy;
    } else {
      comment.likedBy.push(_id);
    }
    await comment.save();
  } else if (type === "post") {
    const post = await Post.findById({ _id: postId });
    const hasLikedComment = post.likedBy.some((ele) => ele.toString() === _id.toString());
    if (hasLikedComment) {
      const likedBy = [...post.likedBy];
      likedBy.splice(likedBy.indexOf(_id), 1);
      post.likedBy = likedBy;
    } else {
      post.likedBy.push(_id);
    }
    await post.save();
  } else if (type === "reply") {
    const reply = await Reply.findById({ _id: replyId });
    const hasLikedComment = reply.likedBy.some((ele) => ele.toString() === _id.toString());
    if (hasLikedComment) {
      const likedBy = [...reply.likedBy];
      likedBy.splice(likedBy.indexOf(_id), 1);
      reply.likedBy = likedBy;
    } else {
      reply.likedBy.push(_id);
    }
    await reply.save();
  }
  res.status(200).json({
    status: "success",
    meta: {},
  });
});

module.exports = {
  createPost,
  createComment,
  createReply,
  getAllPost,
  getOnePost,
  searchPost,
  getAllPostComment,
  like,
};
