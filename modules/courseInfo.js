const mongoose = require('mongoose');

const courseInfoSchema = new mongoose.Schema({
    courseType: {
        type:String,
        require:true,
    },
    information:{
        type:String,
        default:'',
    },
    courseID:{
        type:String,
    },
    courseName: {
        type: String,
        require: true,
    },
    teacherID: {
        type: String,
        require: true,
    },
    teacherName:{
        type: String,
        require: true,
    },
    TA:[{
        ID: {
            type:String
        },
    }],
    faculty: {
        type: String,
        require: true
    },
    DurationTime: {
        type: String,
        require: true
    },
    state: {
        type: String,
        default: 1,
    },
    students:[{
        type:String,
    }],
    content: [  // 课程内容，一个元素为一个章节
        {
            //id: Number,  // 编号
            ChapterName: String,  // 章节名称
            part: [
                {
                    //id: Number,  // 编号
                    Filename: String,  // 文件内容
                    Fileurl: String  // 内容
                }
            ]
        }
    ],
    created: {
        type: Date,
        default: Date.now
    },
    img: {
        type: String,
        default: '/img/course/default.png'
    },
});
module.exports = mongoose.model('CourseInfo', courseInfoSchema);
