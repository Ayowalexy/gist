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

    const { id } = req.params
    const user = await User.findById({ _id: id });



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

const addImages = asyncHandlers(async( req, res) => {
    const { id } = req.params;
    await User.findByIdAndUpdate({ _id: id },
        {
            $push:
                { portfolioImages: req.body.images }
        }
    )
    res.status(200)
        .json(
            {
                status: "success",
                message: "Images added",
                meta: {}
            })


})


const getProfileInformation = asyncHandlers(async (req, res) => {

    const user = await User.findById({ _id: req.params.id })
        .populate('post');
    const post = await Post.find({ createdBy: { $exists: true, $in: [`${req.params.id}`] } });
    const comment = await Comment.find({ createdBy: { $exists: true, $in: [`${req.params.id}`] } });

    const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        state: user.state,
        city: user.city,
        location: user.location,
        about: user.about,
        clients: user.clients,
        total_income: user.total_income,
        total_withdrawal: user.total_withdrawal,
        total_balance: user.total_balance,
        bank: user.bank,
        hires: user.hires,
        bookmarks: user.bookmarks, 
        userImg: user.userImg,
        experience: user.experience,
        portfolioImages: user.portfolioImages,
        notifications: user.notifications,
        isHandyMan: user.isHandyMan,
        rating: user.rating,
        ratedBy: user.ratedBy,
        serviceCharge: user.serviceCharge,
        post: user.post,
        _id: user._id,
        accountBalance: user.accountBalance
    }
    const data = {
        user: userData,
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
    getAllBookmarks,
    addImages
}