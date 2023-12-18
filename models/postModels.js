const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./commentModel')


const postSchema = new Schema({
    comments: [{
        type: Schema.Types.ObjectId,
        ref: Comment
    }],
    post: String,
    user: {
        ref: "user",
        type: Schema.Types.ObjectId
    },
    images: [{
        type: String
    }],
    likes: {
        default: 0, 
        type: Number
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model('post', postSchema)