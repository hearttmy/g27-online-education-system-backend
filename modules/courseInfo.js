const mongoose = require('mongoose');

const courseInfoSchema = new mongoose.Schema({
    courseType: {
        type:String,
        require:true,
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
    faculty: {
        type: String,
        require: true
    },
    DurationTime: {
        type: String,
        require: true
    },
    status: {
        type: String,
    },
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

    bulletins: [
        {
            content: String,
            created: {
                type: Date,
                default: Date.now
            }
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

// courseInfoSchema.index({
//     coursename: 'text',
//     'content.stamp': 'text',
//     'content.part.title': 'text',
//     'content.part.content': 'text',
// })

module.exports = mongoose.model('CourseInfo', courseInfoSchema);