const User = require('../models/userModel');
const asyncHandlers = require('express-async-handler');
const auth = require('basic-auth')
const Post = require('../models/postModels');
const Comment = require('../models/commentModel');
const {
    profileInformationSchema,
    handyManprofileInformationSchema,
    handyManPortfolio,
    bookmarkSchema
} = require('../middleswares/schema')



const addInformation = asyncHandlers(async (req, res) => {

    if ((Object.keys(req.body).includes('isHandyMan')) && (typeof req.body.isHandyMan === 'boolean')) {

        const { error, value } = req.body.isHandyMan
            ? handyManprofileInformationSchema.validate(req.body)
            : profileInformationSchema.validate(req.body)

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

        const { id } = req.params;

        delete value.isHandyMan;

        await User.findByIdAndUpdate({ _id: id }, { ...value, isProfileComplete: true })
        res.status(200)
            .json(
                {
                    status: "success",
                    message: "user updated scuccessfully",
                    meta: {}
                })
    } else {
        res.status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: 'isHandyMan field is required and must be a boolean'
                    }
                })
    }
})


const addServiceCharge = asyncHandlers(async (req, res) => {

    const { _id } = req.user._id

    const user = await User.findById({ _id });


    if (user && user.isHandyMan) {
        user.serviceCharge = req.body.serviceCharge;
        await user.save();

        res.status(200)
            .json(
                {
                    status: "success",
                    message: "service charge added scuccessfully",
                    meta: {}
                })
    } else {
        res.status(401)
            .json(
                {
                    status: "errror",
                    message: "invalid request",
                    meta: { error: "Only handyman can add service charge" }
                })
    }



})


const updateHandymanPortfolio = asyncHandlers(async (req, res) => {

    const { error, value } = handyManPortfolio.validate(req.body);
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

    const images = value.images.split('#');
    const { id } = req.params
    await User.findByIdAndUpdate({ _id: id },
        {
            $push:
                { portfolioImages: images },
            about: value.about
        }
    )

    const data = {
        portfolioImages: value.images,
        about: value.about
    }

    res.status(200)
        .json(
            {
                status: "success",
                message: "service charge added scuccessfully",
                data,
                meta: {}
            })

})


const getProfileInformation = asyncHandlers(async (req, res) => {

    const user = await User.findById({ _id: req.params.id })
        .populate('post');
    const post = await Post.find({ createdBy: { $exists: true, $in: [`${req.params.id}`] } });
    const comment = await Comment.find({ createdBy: { $exists: true, $in: [`${req.params.id}`] } });

    const data = {
        // firstName: user.firstName,
        // lastName: user.lastName,
        // phoneNumber: user.phoneNumber,
        // email: user.email,
        // portfolioImages: user.portfolioImages,
        // post: user.post,
        // isHandyMan: user.isHandyMan,
        user,
        postCommented: post,
        commentReplied: comment
    }

    res.status(200)
        .json(
            {
                status: "success",
                data,
                meta: {}
            })
})


const bookmark = asyncHandlers(async (req, res) => {

    const { error, value } = bookmarkSchema.validate(req.body);
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

    const bookmarkData = value.type === 'post'
        ? await Post.findById({ _id: value.id })
        : await User.findById({ _id: value.id });
    const user = await User.findById({ _id: req.user._id });

    if (bookmarkData && user) {
        user.bookmarks.push(bookmarkData);
        await user.save();
    }
    res.status(200)
        .json(
            {
                status: "success",
                data: bookmarkData,
                meta: {}
            })

})


const getAllBookmarks = asyncHandlers(async (req, res) => {
    const { _id } = req.user;

    const user = await User.findById({ _id });

    if (user) {
        const bookmarks = user.bookmarks;
        res.status(200)
            .json(
                {
                    status: "success",
                    data: bookmarks,
                    meta: {}
                })
    }
})

module.exports = {
    addInformation,
    addServiceCharge,
    updateHandymanPortfolio,
    getProfileInformation,
    bookmark,
    getAllBookmarks
}