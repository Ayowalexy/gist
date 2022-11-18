const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const notificationSchema = new Schema({
    title: String,
    type: {
        type: String,
        enum: ['payment', 'bookmark', 'comment', 'message', 'hire']
    }
}, { timestamps: true })

module.exports = mongoose.model('notification', notificationSchema)