const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token

    try {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ')
            const bearerToken = bearer[1]
            token = bearerToken;
            const decoded = jwt.verify(bearerToken, process.env.SECRET)
            const user = await User.findOne({ email: decoded.email });
            

            if (user) {
                req.user = user;
                next()
            } else {
                res
                    .status(401)
                    .json(
                        {
                            status: "error",
                            message: "invalid request",
                            meta: {
                                error: 'user does not exist'
                            }
                        })
            }
        }
    } catch (e) {
        res.status(401)
        throw new Error('Not authorized, token failed')
    }

    if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})


const isHandyMan = asyncHandler( async (req, res, next) => {
    if (req.user && req.user.isHandyMan) {
        next()
      } else {
        res
        .status(401)
        .json(
            {
                status: "error",
                message: "invalid request",
                meta: {
                    error: 'only handy man can add service charge'
                }
            })
      }
})


const isCustomer = asyncHandler( async (req, res, next) => {
    console.log(req.user && !req.user.isHandyMan)
    if (req.user && !req.user.isHandyMan) {
        next()
      } else {
        res
        .status(401)
        .json(
            {
                status: "error",
                message: "invalid request",
                meta: {
                    error: 'Only Customers can perform this action'
                }
            })
      }
})


module.exports = {
    protect,
    isHandyMan,
    isCustomer
}