const mongoose = require('mongoose');

const courseInfoSchema = new mongoose.Schema({
    courseID: {
        type: String,
        require: true,
        unique: true,
    },
    coursename: {
        type: String,
        require: true,
    },
    teacherID: {
        type: String,
        require: true,
    },
    DurationTime: {
        type: String,
        require: true
    },
    status: [
        {
            id: String
        }
    ],
    content: [  // 课程内容，一个元素为一个章节
        {
            id: Number,  // 编号
            stamp: String,  // 章节名称
            part: [
                {
                    id: Number,  // 编号
                    title: String,  // 单元名称
                    content: String  // 内容
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
        default: '/static/img/avatar/default.png'
    },
});

// courseInfoSchema.index({
//     coursename: 'text',
//     'content.stamp': 'text',
//     'content.part.title': 'text',
//     'content.part.content': 'text',
// })

module.exports = mongoose.model('CourseInfo', courseInfoSchema);