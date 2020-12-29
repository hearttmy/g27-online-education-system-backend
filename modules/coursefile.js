const mongoose = require('mongoose');

const courseFileSchema = new mongoose.Schema({
    Filename: {
        type:String,
        require:true
    },  // 文件内容
    Fileurl: {
        type:String,
        require:true
    }   // 内容
})
module.exports = mongoose.model('CourseFile', courseFileSchema);
