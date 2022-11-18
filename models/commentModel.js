const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Replies = require('./repliesSchema')

const commentSchema = new Schema({
    name: String,
    comment: String,
    postId: String,
    createdBy: String,
    likes: {
        default: 0,
        type: Number
    },
    replies: [{
        type: Schema.Types.ObjectId,
        ref: Replies
    }]
}, {
    timestamps: true
})


module.exports = mongoose.model('comment', commentSchema)