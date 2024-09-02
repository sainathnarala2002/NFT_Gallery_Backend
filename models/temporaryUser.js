const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    emailOtp: {
        type: Number,
        default: null
    },
    mobileOtp: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        expires: 120,  
        default: Date.now(),
    }
});

const TemporaryUser = mongoose.model("temporaryUser", schema)
module.exports = TemporaryUser;