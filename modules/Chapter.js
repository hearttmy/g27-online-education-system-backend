const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const chaSchema = new Schema({
        id: Number,  // 编号
        ChapterName: String,  // 章节名称
        part: [
            {
                id: Number,  // 编号
                Filename: String,  // 文件内容
                Fileurl: String  // 内容
            }
        ]
});

module.exports = chapter = mongoose.model('chapter', chaSchema);