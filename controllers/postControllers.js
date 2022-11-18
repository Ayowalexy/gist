const Post = require('../models/postModels');
const asyncHandler = require('express-async-handler');
const { postSchema, commentSchema, replySchema } = require('../middleswares/schema');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const Reply = require('../models/repliesSchema');
const Notification = require('../models/notificationModel');



const createPost = asyncHandler(async (req, res) => {

    const { error, value } = postSchema.validate(req.body);

    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }

    const { _id } = req.user;

    const user = await User.findById({ _id: value.createdBy });

    const postImages = value.postImgs.split('#')

    if (user) {
        const post = new Post({ ...value, userImg: user.userImg, images: postImages });
        await post.save();

        await User.findByIdAndUpdate(
            { _id: _id },
            {
                $push:
                    { post: post }
            }
        )
        return res
            .status(201)
            .json(
                {
                    status: "success",
                    message: "post created scuccessfully",
                    data: post,
                    meta: {}
                })


    } else {
        res.status(404)
        throw new Error(`user with ${value.createdBy} does not exist`)
    }

})


const createComment = asyncHandler(async (req, res) => {

    const { error, value } = commentSchema.validate(req.body);
    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }

    const { postId } = value;

    const post = await Post.findById({ _id: postId });

    if (post) {
        const user = await User.findById({ _id: post.createdBy });
        const comment = new Comment(value);
        await comment.save();

        const userNotification = new Notification({
            type: 'comment',
            title: `${comment.name} commented on your post`
        })

        userNotification.save();
        user.notifications.push(userNotification)

        await user.save();

        post.comments.push(comment);
        await post.save();
        res
            .status(201)
            .json(
                {
                    status: "success",
                    message: "comment created scuccessfully",
                    data: comment,
                    meta: {}
                })
    }


})


const createReply = asyncHandler(async (req, res) => {

    const { error, value } = replySchema.validate(req.body);

    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }

    const { commentId } = value;
    const comment = await Comment.findById({ _id: commentId });
    if (comment) {
        const user = await User.findById({ _id: comment.createdBy });
        const reply = new Reply(value);
        await reply.save();
        const notification = new Notification({
            type: 'comment',
            title: `${reply.name} just replied to your comment`
        })
        await notification.save();
        user.notifications.push(notification)
        await user.save();
        comment.replies.push(reply)
        await comment.save()
        res
            .status(201)
            .json(
                {
                    status: "success",
                    message: "reply created scuccessfully",
                    data: reply,
                    meta: {}
                })
    }




})


const getAllPost = asyncHandler(async (req, res) => {

    const post = await Post.find();
    res
        .status(200)
        .json(
            {
                status: "success",
                data: post,
                meta: {}
            })
})

const getOnePost = asyncHandler(async (req, res) => {

    const post = await Post
        .findById({ _id: req.params.id })
        .populate({
            path: 'comments',
            populate: { path: 'replies' }
        })

    if (post) {
        res
            .status(200)
            .json(
                {
                    status: "success",
                    data: post,
                    meta: {}
                })
    } else {
        res
            .json(
                {
                    status: 'error',
                    message: 'invalid request',
                    meta: { error: `Post with ${req.params.id} does not exist` }
                })
    }
})

const searchPost = asyncHandler(async (req, res) => {


    const term = req.query.name

    const post = await Post.find({ name: { '$regex': `^${term}$`, '$options': 'i' } });
    res
        .status(200)
        .json(
            {
                status: "success",
                data: post,
                meta: {}
            })

})


module.exports = {
    createPost,
    createComment,
    createReply,
    getAllPost,
    getOnePost,
    searchPost
}