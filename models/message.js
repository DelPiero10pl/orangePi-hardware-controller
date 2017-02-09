const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
    requestType: String,
    updateTime: {
        type: Date,
        required: true,
        index: { unique: true }
    },
    decision: { type: String, default: 'NODECISION' }
})

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;