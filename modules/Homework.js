const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hwSchema = new mongoose.Schema({
        courseID: {
            type: String,
            require: true,
        },
        hwName: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        File: [
            {
                fileName: String,
                fileUrl: String,
            }
        ],
        NumOfSub:{
            type:Number,
            default:0
        },
        beginDate: {
            type: Date,
        },
        deadline: {
            type: Date,
        },
        proportion:{
            type: Number,
        },
        type:{
            type:String,
        },
        target:{
            type:String,
            default:"提交作业"
        },
        releaseTime:{
            type:String,
            default:"马上发布"
        }
    }
)

module.exports = Homework = mongoose.model('Homework', hwSchema);