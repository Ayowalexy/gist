const asyncHandlers = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { userAccountSignupSchema, emailSchema, otpSchema, passwordSchema, updateProfileSchema } = require('../middleswares/schema');
const sgMail = require('@sendgrid/mail');
const otpGenerator = require('otp-generator');


const createAccount = asyncHandlers(async (req, res) => {

    const { error, value } = userAccountSignupSchema.validate(req.body);

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

    const hash = await bcrypt.hashSync(value.password, 12);
    const user = new User({ ...value, password: hash });
    await user.save();
    res
        .status(201)
        .json(
            {
                status: "success",
                userId: user._id,
                isHandyMan: user.isHandyMan,
                message: "user created scuccessfully",
                meta: {}
            })
})


const login = asyncHandlers(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {

        if (user.isProfileComplete) {
            const match = await bcrypt.compareSync(req.body.password, user.password);

            if (match) {
                const token = jwt.sign({ email: user.email }, process.env.SECRET)

                res
                    .status(200)
                    .json(
                        {
                            _id: user._id,
                            email: user.email,
                            token: token,
                            isHandyMan: user.isHandyMan,
                            status: "success",
                            meta: {}
                        })
            } else {
                res
                    .status(401)
                    .json(
                        {
                            status: "error",
                            message: 'invalid request',
                            meta: {
                                error: 'Email of password is incorrect'
                            }
                        })
            }
        } else {
            res
                .status(401)
                .json(
                    {
                        status: "error",
                        message: 'invalid request',
                        userId: user._id,
                        isHandyMan: user.isHandyMan,
                        meta: {
                            error: 'Account profile not complete'
                        }
                    })
        }

    } else {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: 'email does not exist'
                    }
                })
    }
})

const getPasswordResetToken = asyncHandlers(async (req, res) => {

    const { error, value } = emailSchema.validate(req.body)
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
    const user = await User.findOne({ email: value.email });
    if (user) {
        const API_KEY = process.env.SG_API;

        sgMail.setApiKey(API_KEY);
        const otp = otpGenerator.generate(6, { digits: true, specialChars: false, lowerCaseAlphabets: false, upperCaseAlphabets: false })

        const capitalizeOtp = otp.toString().toUpperCase();

        const signedToken = jwt.sign({ capitalizeOtp }, process.env.SECRET, {
            expiresIn: 60 * 2,
        })

        user.otpToken = signedToken;

        await user.save();

        const name = user.firstName && user.lastName ? user.firstName.concat(' ', user.lastName) : 'Chief'

        const message = {
            to: user.email,
            from: {
                name: "Gist Support Team",
                email: "goldenimperialswifttech@gmail.com"
            },
            text: "Hello Sample text",
            subject: "Verify OTP",
            html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Gist</a>
                        </div>
                        <p style="font-size:1.1em">Hi ${name},</p>
                        <p>Thank you for choosing Gist. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${capitalizeOtp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />Gist</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                        <p>Gist Inc</p>
                        <p>1600 Amphitheatre Parkway</p>
                        <p>Lagos, Nigeria</p>
                        </div>
                    </div>
                    </div>`
        }

        sgMail.send(message)
            .then(res => {
                // console.log(res)
            })
            .catch(err => {
                console.log(err)
            })

        res
            .status(201)
            .json(
                {
                    status: "success",
                    message: "email sent scuccessfully",
                    meta: {}
                })
    } else {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: { error: "email does not exist" }
                })
    }
})

const verifyOtp = asyncHandlers(async (req, res) => {

    const { error, value } = otpSchema.validate(req.body);
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
    const user = await User.findOne({ email: value.email });

    if (user) {
        const otpToken = user.otpToken;

        try {
            const decoded = jwt.verify(otpToken, process.env.SECRET);
            if (value.otp === decoded.capitalizeOtp) {
                user.canResetPassword = true;
                await user.save();
                res
                    .status(200)
                    .json(
                        {
                            status: "success",
                            message: "OTP verified scuccessfully",
                            meta: {}
                        })
            } else {
                res.status(401)
                    .json(
                        {
                            status: "error",
                            message: "invalid request",
                            meta: {
                                error: "OTP does match"
                            }
                        })
            }
        } catch (e) {
            return res
                .status(404)
                .json(
                    {
                        status: "error",
                        message: "invalid request",
                        meta: {
                            error: "OTP has exprired"
                        }
                    })
        }


    } else {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: { error: "email does not exist" }
                })
    }

})

const resetPassword = asyncHandlers(async (req, res) => {

    const { error, value } = passwordSchema.validate(req.body)
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

    const user = await User.findOne({ email: value.email });

    if (user) {
        if (user.canResetPassword) {
            const hash = await bcrypt.hashSync(value.password, 12);
            user.password = hash;
            user.canResetPassword = false;
            await user.save();
            res
                .status(200)
                .json(
                    {
                        status: "success",
                        message: "password changed scuccessfully",
                        meta: {}
                    })
        } else {
            res
                .status(401)
                .json(
                    {
                        status: "error",
                        message: "invalid request",
                        meta: {
                            error: "You need to verify your email address first"
                        }
                    })
        }
    } else {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: 'User does not exist'
                    }
                })
    }
})


const updateProfile = asyncHandlers(async (req, res) => {

    const { error, value } = updateProfileSchema.validate(req.body);

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

    await User.findOneAndUpdate({ _id: req.user._id?.toString() }, { ...value })
    res
        .status(200)
        .json(
            {
                status: "success",
                message: "profile updated successfully",
                meta: {}
            })
})

module.exports = {
    createAccount,
    login,
    getPasswordResetToken,
    verifyOtp,
    resetPassword,
    updateProfile
}