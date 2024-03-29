const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const hireSchema = new Schema({
    jobDescription: String,
    jobTitle: String,
    workingHours: Number,
    chargePerHour: Number,
    totalAmount: Number,
    partPayment: Number,
    handyManId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    txtRef: String,
    hoursPaid: Number,
    cancelReason: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['completed', 'in progress', 'canceled', 'hired']
    },
    isPaidFully: {
        type: Boolean,
        default: false
    },
    isPaid: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('hire', hireSchema);