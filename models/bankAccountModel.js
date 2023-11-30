const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bankSchema = new Schema({
    account_number: String,
    account_bank: String,
    bank_id: String,
    recipient_code: String,
    account_name: String
})

module.exports = mongoose.model('bank', bankSchema);