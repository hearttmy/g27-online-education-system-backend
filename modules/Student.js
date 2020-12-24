const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stuSchema = new Schema({
    id: {
        type: String,
        require: true,
        unique: true
    },
    username: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true
    },
    department: {
        type: String,
        require: true
    },
    data: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String,
        default: '/static/img/avatar/default.png'
    },

});

module.exports = Student = mongoose.model('Student', stuSchema);