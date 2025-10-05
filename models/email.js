const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    from: { type: String, required: true },
    fromName: { type: String, required: true },
    subject: { type: String, required: true },
    avatarurl: { type: String, required: false }
});

module.exports = mongoose.model('email', emailSchema);