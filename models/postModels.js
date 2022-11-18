const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./commentModel')


const postSchema = new Schema({
    comments: [{
        type: Schema.Types.ObjectId,
        ref: Comment
    }],
    post: String,
    name: String,
    createdBy: String,
    userImg: String,
    images: [{
        type: String
    }],
    likes: {
        default: 0, 
        type: Number
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('post', postSchema)