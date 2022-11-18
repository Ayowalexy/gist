const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const repliesSchema = new Schema({
    name: String,
    reply: String,
    commentId: String,
    createdBy: String
}, {
    timestamps: true
})


module.exports = mongoose.model('replies', repliesSchema)