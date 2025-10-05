const mongoose = require('mongoose');

const sentSchema = new mongoose.Schema({
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
});

module.exports = mongoose.model('sent', sentSchema);


