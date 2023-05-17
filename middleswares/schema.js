const Joi = require('joi');


const profileInformationSchema = Joi.object({
    firstName: Joi
        .string()
        .required(),
    lastName: Joi
        .string()
        .required(),
    phoneNumber: Joi
        .string()
        .required(),
    dateOfBirth: Joi
        .string()
        .required(),
    gender: Joi
        .string()
        .required(),
    state: Joi
        .string()
        .required(),
    city: Joi
        .string()
        .required(),
    isHandyMan: Joi
        .boolean()
        .required()

})

const handyManprofileInformationSchema = Joi.object({
    firstName: Joi
        .string()
        .required(),
    lastName: Joi
        .string()
        .required(),
    phoneNumber: Joi
        .string()
        .required(),
    dateOfBirth: Joi
        .string()
        .required(),
    gender: Joi
        .string()
        .required(),
    state: Joi
        .string()
        .required(),
    city: Joi
        .string()
        .required(),
    location: Joi
        .string()
        .required(),
    experience: Joi
        .number()
        .required(),
    about: Joi
        .string()
        .required(),
    isHandyMan: Joi
        .boolean()
        .required(),
    serviceCategory: Joi
        .string()
        .required()

})



const userAccountSignupSchema = Joi.object({
    email: Joi
        .string()
        .email()
        .required(),
    password: Joi
        .string()
        .required(),
    isHandyMan: Joi
        .boolean()
        .required()
})


const postSchema = Joi.object({
    post: Joi
        .string()
        .required(),
    name: Joi
        .string()
        .required(),
    createdBy: Joi
        .string()
        .required(),
    postImgs: Joi
        .string()
        .required()
})


const commentSchema = Joi.object({
    userImg: Joi
        .string(),
    // .required(),
    name: Joi
        .string()
        .required(),
    comment: Joi
        .string()
        .required(),
    postId: Joi
        .string()
        .required(),
    createdBy: Joi
        .string()
        .required(),
})

const replySchema = Joi.object({
    name: Joi
        .string()
        .required(),
    reply: Joi
        .string()
        .required(),
    commentId: Joi
        .string()
        .required(),
    createdBy: Joi
        .string()
        .required(),
})

const emailSchema = Joi.object({
    email: Joi
        .string()
        .email()
        .required(),
})

const passwordSchema = Joi.object({
    password: Joi
        .string()
        .required(),
    email: Joi
        .string()
        .email()
        .required()
})

const otpSchema = Joi.object({
    otp: Joi
        .string()
        .required(),
    email: Joi
        .string()
        .email()
        .required()
})


const hireSchema = Joi.object({
    jobDescription: Joi
        .string()
        .required(),
    jobTitle: Joi
        .string()
        .required(),
    workingHours: Joi
        .number()
        .required(),
    handyManId: Joi
        .string()
        .required(),
    clientId: Joi
        .string()
        .required(),
    amount: Joi
        .number()
        .required()

})


const handyManPayment = Joi.object({
    amount: Joi
        .number()
        .required(),
    hireId: Joi
        .string()
        .required(),
    narration: Joi
        .string()
        .required()
})


const handyManPortfolio = Joi.object({
    images: Joi
        .string()
        .required(),
    about: Joi
        .string()
        .required()
})


const notificationSchema = Joi.object().keys({
    type: Joi
        .string()
        .valid('payment', 'bookmark', 'comment', 'message', 'hire')
        .required(),
    title: Joi
        .string()
        .required()
});

const cancelHireSchema = Joi.object().keys({
    status: Joi
        .string()
        .valid('canceled')
        .required(),
    reason: Joi
        .string()
});


const bookmarkSchema = Joi.object({
    type: Joi
        .string()
        .valid('post', 'handyman')
        .required(),
    id: Joi
        .string()
        .required()
})

const updatehandyManWorkHourSchema = Joi.object({
    outstandingHour: Joi
        .number()
        .required()
})

const bankAccountSchema = Joi.object({
    account_number: Joi
        .string()
        .required(),
    account_bank: Joi
        .string()
        .required()
})

const updateProfileSchema = Joi.object({
    firstName: Joi
        .string()
        .required(),
    lastName: Joi
        .string()
        .required(),
    phoneNumber: Joi
        .string()
        .required(),
    gender: Joi
        .string()
        .required(),
    state: Joi
        .string()
        .required(),
    city: Joi
        .string()
        .required(),
    userImg: Joi
        .any()

})

module.exports = {
    profileInformationSchema,
    userAccountSignupSchema,
    postSchema,
    commentSchema,
    replySchema,
    emailSchema,
    otpSchema,
    passwordSchema,
    handyManprofileInformationSchema,
    hireSchema,
    handyManPayment,
    handyManPortfolio,
    notificationSchema,
    cancelHireSchema,
    bookmarkSchema,
    updatehandyManWorkHourSchema,
    bankAccountSchema,
    updateProfileSchema

}