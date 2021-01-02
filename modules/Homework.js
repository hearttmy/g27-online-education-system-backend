const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hwSchema = new mongoose.Schema({
    courseID: {
        type: String,
        require: true,
    },
    hwName:{
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    File: [
            {
            fileName:String,
            fileUrl:String,
        }
    ],
    beginDate:{
        type:Date,
    },
    deadline:{
        type:Date,
    }
})

module.exports = Homework = mongoose.model('Homework', hwSchema);