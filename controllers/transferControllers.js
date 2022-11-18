const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Hire = require('../models/hireModel');
const axios = require('axios');
const Notification = require('../models/notificationModel')
const { bankAccountSchema, handyManPayment } = require('../middleswares/schema')
const Flutterwave = require('flutterwave-node-v3');
const Bank = require('../models/bankAccountModel');
const currencyFormatter = require('currency-formatter');
const initPaymant = require('../utils/initPayment')
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);



const getAllBanks = asyncHandler(async (req, res) => {

    const { _id } = req.user;
    const user = await User.findById({ _id });
    if (user) {
        const response = await axios(`${process.env.BASE_API_URL}/banks/NG`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
            }
        })
        res.status(200).json(response.data)
    }
})

const verifyBankAccount = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { error, value } = bankAccountSchema.validate(req.body);
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

    const user = await User.findById({ _id });

    if (user) {
        try {
            const { account_number, account_bank } = value;
            const url = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${account_bank}`
            const response = await axios(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.PAYSTACK_SK}`
                }
            })
            if (response.data.status) {
                const bank = new Bank(value);
                await bank.save();
                user.bank = bank;
                await user.save();
                res.status(200).json(response.data)
            }

        } catch (e) {
            res
                .status(401)
                .json(
                    {
                        status: "error",
                        message: "invalid request",
                        meta: {
                            error: e?.response?.data?.message || 'Could not resolve account name. Check parameters or try again.'
                        }
                    })
        }
    }
})


const payForHandyManHire = asyncHandler(async (req, res) => {

    const { error, value } = handyManPayment.validate(req.body);
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

    const hire = await Hire.findById({ _id: value.hireId });

    if (hire && hire.status !== 'canceled') {

        const handyMan = await User.findById({ _id: hire.handyManId }).populate('bank')
        const client = await User.findById({ _id: hire.clientId });

        const partPayment = hire.partPayment;
        const totalAmount = hire.totalAmount;
        const balance = totalAmount - partPayment;

        if (value.amount <= balance) {

            hire.partPayment = Number(partPayment) + Number(value.amount);
            hire.isPaid = true;
            hire.status = 'in progress';
            hire.hoursPaid = hire.workingHours / 2

            const formatPartPayment = currencyFormatter.format(partPayment, { code: 'NGN' });
            const formatBalance = currencyFormatter.format(balance, { code: 'NGN' });

            const {
                account_bank,
                account_number,
                 } = handyMan?.bank;
            const {
                narration, amount
            } = value


            const data = {account_bank, account_number, narration, amount }

            if (account_bank && account_number && narration && amount) {
                const paymentHandyMan = await initPaymant(data);
                // const clientNotification = new Notification({
                //     type: 'payment',
                //     title: `You just paid ${formatPartPayment} to ${handyMan.firstName.concat(' ', handyMan.lastName)} 
                //             for ${hire.jobTitle}, to balance ${formatBalance}`
                // })

                // const handyManNotification = new Notification({
                //     type: 'payment',
                //     title: `${client.firstName.concat(' ', client.lastName)} just paid you ${formatPartPayment} 
                //             for ${hire.jobTitle}, to balance ${formatBalance}`
                // })

                // const amountPaid = (Number(partPayment) + Number(value.amount));
                // const formatAmountPaid = currencyFormatter.format(amountPaid, { code: 'NGN' });

                // if (amountPaid === totalAmount) {
                //     hire.isPaidFully = true;
                //     hire.status = 'completed';
                //     clientNotification.title = `You have successfully completed the payment of ${formatAmountPaid} 
                //                                 for the service ${hire.jobTitle} to ${handyMan.firstName.concat(' ', handyMan.lastName)}`

                //     handyManNotification.title = `You have been completely paid ${formatAmountPaid} 
                //                                 for the service ${hire.jobTitle}`
                // }

                // await hire.save();
                // await clientNotification.save();
                // await handyManNotification.save();
                // client.notifications.push(clientNotification);
                // handyMan.notifications.push(handyManNotification);
                // await client.save();
                // await handyMan.save();

                // const data = {
                //     jobDescription: hire.jobDescription,
                //     jobTitle: hire.jobTitle,
                //     workingHours: hire.workingHours,
                //     chargePerHour: hire.chargePerHour,
                //     totalAmount: hire.totalAmount,
                //     partPayment: hire.partPayment,
                //     handyManId: hire.handyManId,
                //     clientId: hire.clientId,
                //     txtRef: hire.txtRef,
                //     isPaidFully: hire.isPaidFully,
                //     isPaid: hire.isPaid
                // }

                res.status(200)
                    .json(
                        {
                            status: "success",
                            data: "data",
                            meta: {}
                        })

            } else {
                res.status(401).json({
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: `${handyMan.firstName.concat(' ', handyMan.lastName)} has not added a bank account to receive payments`
                    }
                })
            }

        } else {
            res.status(401)
                .json(
                    {
                        status: "error",
                        message: "invalid request",
                        meta: {
                            error: 'This service is either completely paid for, is canceled or you are trying to pay more than the service amount'
                        }
                    })
        }
    }


});


module.exports = {
    getAllBanks,
    verifyBankAccount,
    payForHandyManHire
}