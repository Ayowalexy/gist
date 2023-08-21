const mongoose = require('mongoose');


const messageSchema = mongoose.Schema({
    message: String,
    sender: String,
    receiver: String,
    users: [{type: String}]
}, { timestamps: true})


module.exports = mongoose.model('message', messageSchema)