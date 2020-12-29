const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const fileschema = new Schema({
    id: Number,  // 编号
    Filename: String,  // 文件内容
    Fileurl: String  // 内容
});

module.exports = FileSchema = mongoose.model('fileschema', fileschema);