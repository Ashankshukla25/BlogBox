// Description: User model schema for MongoDB.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        set: (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
    },
    lastname: {
        type: String,
        required: true,
        set: (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
})

const User = mongoose.model('User', userSchema);
module.exports = User;