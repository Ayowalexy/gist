const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const itemSchema = new Schema({
     item_name: {
        type: String,
        required: true
     },
     price: {
        type: Number,
        required: true,
        default: 0
     },
     descriptions: {
        type: String,
        required: true
     },
     images: [{
        type: String,
        minLength: 0
     }],
     rating: {
        type: Number,
        required: true,
        default: 0
     },
     category: {
        type: String,
        required: true,
     }
}, { timestamps: true });


const Item = mongoose.model('Item', itemSchema);

module.exports = Item;