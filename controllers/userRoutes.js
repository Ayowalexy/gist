const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const Hire = require('../models/hireModel');
const Notification = require('../models/notificationModel');
const {
    hireSchema,
    notificationSchema,
    cancelHireSchema,
    updatehandyManWorkHourSchema
} = require('../middleswares/schema');


const getAllHandyman = asyncHandler(async (req, res) => {
    const allHandyMan = await User.find({ isHandyMan: true });
    res.status(200)
        .json(
            {
                status: "success",
                data: allHandyMan,
                meta: {}
            })
})


const searchHandyMan = asyncHandler(async (req, res) => {

    const term = req.query.name;
    const handyman = await User.find({ name: term, isHandyMan: true });
    res.status(200)
        .json(
            {
                status: "success",
                data: handyman,
                meta: {}
            })
})

const filterHandyMan = asyncHandler(async (req, res) => {

    const { rating, chargeLow, chargeHigh, location } = req.query;
    const handyman = await User.find({
        serviceCharge: { $gte: chargeLow, $lte: chargeHigh },
        // location: location,
        // rating: rating,
        isHandyMan: true
    })

    res.status(200)
        .json(
            {
                status: "success",
                data: handyman,
                meta: {}
            })

})


const hireHandyMan = asyncHandler(async (req, res) => {

    const { error, value } = hireSchema.validate(req.body);
    console.log(req.body)
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

    const handyMan = await User.findById({ _id: value.handyManId });
    const client = await User.findById({ _id: value.clientId });

    if (handyMan && client) {
        const charge = handyMan.serviceCharge;
        if (charge) {

            if(Number(client.accountBalance) < Number(value.amount)){
                throw new Error('Insufficient balance')
            }

            handyMan.accountBalance = Number(handyMan.accountBalance) + Number(value.amount);
            client.accountBalance = Number(client.accountBalance) - Number(value.amount);

            const totalAmount = Number(charge) * Number(value.workingHours);

            const newHire = new Hire({
                ...value,
                chargePerHour: handyMan.serviceCharge,
                totalAmount: totalAmount,
                partPayment: Math.floor(totalAmount / 2),
                status: 'hired',
                handyManId: handyMan,
                clientId: client
            })

            const handyManNotification = new Notification({
                title: `${client.firstName} ${client.lastName} just hire you for ${newHire.jobTitle}`,
                type: 'hire'
            })
            const clientNotification = new Notification({
                title: ` You just hired ${handyMan.firstName} ${handyMan.lastName} for ${newHire.jobTitle}`,
                type: 'hire'
            })

            await handyManNotification.save();
            await clientNotification.save();
            await newHire.save();
            handyMan.clients.push(client);
            handyMan.notifications.push(handyManNotification)
            client.hires.push(handyMan);
            client.notifications.push(clientNotification);
            await client.save();
            await handyMan.save();

            res.status(200)
                .json(
                    {
                        status: "success",
                        data: newHire,
                        meta: {}
                    })
        } else {
            res.status(401)
                .json(
                    {
                        status: "error",
                        message: "invalid request",
                        meta: { error: "Handy man has not added a service charge" }
                    })
        }

    } else {
        res.status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: { error: "Client or handyman does not exist"}
                })
    }
})


const cancelHandyManHire = asyncHandler(async (req, res) => {

    const { error, value } = cancelHireSchema.validate(req.body);
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

    const hire = await Hire.findById({ _id: req.params.id });

    if (hire) {
        hire.status = value.status;
        hire.cancelReason = value.reason;
        await hire.save();
        const data = {
            jobDescription: hire.jobDescription,
            jobTitle: hire.jobTitle,
            workingHours: hire.workingHours,
            chargePerHour: hire.chargePerHour,
            totalAmount: hire.totalAmount,
            partPayment: hire.partPayment,
            handyManId: hire.handyManId,
            clientId: hire.clientId,
            isPaidFully: hire.isPaidFully,
            isPaid: hire.isPaid,
            cancelReason: hire.cancelReason,
            status: hire.status
        }
        res.status(200)
            .json(
                {
                    status: "success",
                    data: data,
                    meta: {}
                })

    }


})

const getAllCustomerHires = asyncHandler(async (req, res) => {


    const hires = await Hire.find().populate('clientId').populate('handyManId')
    const data = hires?.filter(ele => ele?.clientId?._id.toString() === req.user?.id)

    console.log(req.user?._id)
    if (hires) {
        res.status(200)
            .json(
                {
                    status: "success",
                    data: data,
                    meta: {}
                })
    }

})

const getAllHandymanHires = asyncHandler(async (req, res) => {


    const hires = await Hire.find().populate('clientId').populate('handyManId')
    const data = hires?.filter(ele => ele?.handyManId?._id.toString() === req.user?.id)

    if (hires) {
        res.status(200)
            .json(
                {
                    status: "success",
                    data: data,
                    meta: {}
                })
    }

})


const createNotification = asyncHandler(async (req, res) => {

    const { error, value } = notificationSchema.validate(req.body);
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
    const notification = new Notification(value);
    await notification.save();
    await User.findByIdAndUpdate({ _id }, {
        $push: {
            notifications: notification
        }
    })

    res.status(201)
        .json(
            {
                status: "success",
                data: notification,
                meta: {}
            })
});

const getAllNotification = asyncHandler(async (req, res) => {

    const { _id } = req.user;
    const user = await User.findById({ _id }).populate('notifications');
    const notifications = user.notifications
    res.status(200)
        .json(
            {
                status: "success",
                data: notifications,
                meta: {}
            })
})


const getOneHireDetails = asyncHandler(async (req, res) => {

    const hire = await Hire.findById({ _id: req.params.id });

    if (hire) {
        let data = {}
        if (req.user._id.toString() === hire.clientId) {
            const hirer = await User.findById({ _id: hire.clientId });
            data = {
                hirer: {
                    firstName: hirer.firstName,
                    lastName: hirer.lastName,
                    userImg: hirer.userImg,
                    state: hirer.state,
                    city: hirer.city,
                    no_of_hires: hirer.hires.length || 0
                },
                hire
            }
        } else {
            const worker = await User.findById({ _id: hire.handyManId });
            data = {
                worker: {
                    firstName: worker.firstName,
                    lastName: worker.lastName,
                    userImg: worker.userImg,
                    state: worker.state,
                    city: worker.city,
                    no_of_clients: worker.clients.length || 0
                },
                hire
            }
        }

        res.status(200)
            .json(
                {
                    status: "success",
                    data: data,
                    meta: {}
                })
    }else {
        res.status(401)
            .json(
                {
                    status: "error",
                    meta: {error: 'user not found'}
                })
    }

})


const updatehandyManWorkHour = asyncHandler(async (req, res) => {

    const { error, value } = updatehandyManWorkHourSchema.validate(req.body);

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

    const hire = await Hire.findById({ _id: id });

    if (req.user._id.toString() === hire.clientId) {

        const hoursLeft = hire.workingHours - hire.hoursPaid

        const newAmount = Number(value.outstandingHour + hire.workingHours) * Number(hire.chargePerHour);
        hire.workingHours = value.outstandingHour + hire.workingHours;
        hire.totalAmount = newAmount;
        await hire.save();

        const data = {
            jobDescription: hire.jobDescription,
            jobTitle: hire.jobTitle,
            workingHours: hire.workingHours,
            chargePerHour: hire.chargePerHour,
            totalAmount: hire.totalAmount,
            partPayment: hire.partPayment,
            handyManId: hire.handyManId,
            clientId: hire.clientId,
            isPaidFully: hire.isPaidFully,
            isPaid: hire.isPaid,
            cancelReason: hire.cancelReason,
            status: hire.status
        }
        res.status(200)
            .json(
                {
                    status: "success",
                    data: data,
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
                        error: 'only the client can update the working hour'
                    }
                })
    }
})

const getOneHandyManDetails = asyncHandler (async(req, res) => {
    const oneHandyMan = await User.findById({_id: req.params?.id});
    if(oneHandyMan){
        res.status(200)
            .json(
                {
                    status: "success",
                    data: oneHandyMan,
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
                        error: 'User not found'
                    }
                })
    }
})

const getAllCategories = asyncHandler( async( req, res ) => {
    
})


module.exports = {
    getAllHandyman,
    searchHandyMan,
    filterHandyMan,
    hireHandyMan,
    createNotification,
    getAllNotification,
    cancelHandyManHire,
    getAllCustomerHires,
    getOneHireDetails,
    updatehandyManWorkHour,
    getOneHandyManDetails,
    getAllHandymanHires
}

