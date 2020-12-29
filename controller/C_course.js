const Course = require('../modules/courseInfo');
const Teacher = require('../modules/Teacher');
const tool = require('../config/tool');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');
const passport = require('koa-passport');
const fs = require('fs');
const path = require('path');
const uid = require('uid');
const mime = require('mime-types');
const formidable=require('formidable');

module.exports = {

    async addcourse (ctx) {
        console.log(ctx.request.body);
        //const findResult = await Course.find({id: ctx.request.body.courseID});
        const teacherID = ctx.state.user[0].id;
        const courseID = uid.uid(16);
        console.log(ctx.state.user[0].teacherID);
        //if(findResult.length>0){
        //    ctx.body = {state:false};
        //}else{
        const newCourse = new Course({
            courseName: ctx.request.body.coursename,
            //courseID: ctx.request.body.courseID,
            courseID: courseID,
            DurationTime: ctx.request.body.Year + ctx.request.body.Season,
            teacherID: teacherID,
            courseType: ctx.request.body.coursetype,
        })

        await newCourse.save().then(user => {
            ctx.body = {state: true};
        }).catch(err => {
            console.log(err);
        });
    },


    /*
    新增章节
    输入{courseID,ChapterName}
    输出{state}
     */
    async addChapter(ctx) {
        const {
            courseID,
            //newChapter,
            ChapterName,
        } = ctx.request.body ;
        const tchid = ctx.state.user[0].id;
        const cou = await Course.find({courseID:courseID});
        if(cou[0].teacherID != tchid){
            return ctx.body = {state:false};
        }

        await Course.updateOne({
                courseID:courseID
            },{
                $push:{
                    content:{
                        ChapterName
                    }
                }
            })
            .then(()=>{
                return ctx.body = {
                    state : true,
                }
            })
            .catch(err => {
                return ctx.body ={
                    state : false,
                    errMsg: err.message
                }
            })
    },
    /*
    添加课件
    输入{CourseID/ChapterID/FileName}
    输出{state}
     */
    async AddFile(ctx){
        console.log(ctx.request.body);
        const {
            courseID,
            chapterID,
            fileName,
        }=ctx.request.body;
        //验证是否为该门课的教师
        const tchid = ctx.state.user[0].id;
        const cou = await Course.find({courseID:courseID});
        if(cou[0].teacherID != tchid){
            return ctx.body = {state:false};
        }

        const File = ctx.request.files.file;    //拿到文件对象
        const extName = path.extname(File.name);//拓展名
        const name = `cou_${chapterID + fileName}`;//文件名

        fs.renameSync(File.path, path.join(__dirname, `../static/file/${name}`));
        await Course.updateOne({
                "courseID":courseID,
                "content._id":chapterID,
            },{
                $push:{
                    [`content.$.part`]:{
                        Filename: fileName,
                        Fileurl:`/file/${name}`,
                    }
                }
            })
            .then(()=>{
                 ctx.body = {
                    state : true,
                }
            })
            .catch(err => {
                 ctx.body ={
                    state : false,
                    errMsg: err.message
                }
            })
    },

    /*
    获得课程信息
    通过Get的query字段获得courseID
    在数据库中通过teacherid字段查找并返回课程的所有信息
     */
    async CoursebyID(ctx){
        //console.log(ctx.request.query);
        // const couID = ctx.request.query.courseID;
        // const findResult = await Course.find({courseID:couID});
        // const Couteacher = await Teacher.find({id:findResult[0].teacherID});
        // ctx.body= {
        //     cou : findResult[0],
        //     teacher : Couteacher
        // };
        const couID = ctx.request.query.courseID;
        const docs = await Course.aggregate([{
            $match: {
                courseID:couID
            }
        }, {
            $lookup: {
                from: "teachers",
                localField: "teacherID",
                foreignField: "id",
                as: "teacher"
            }
        },{
            $project: {
                _id:0,
                __v:0,
                teacher:{
                    _id:0,
                    __v:0,
                    password:0,
                    created:0,
                }
            }
            }]
        )
        ctx.body=docs[0];
    },
    /*
    获得课程信息
    通过Get的query字段获得courseID
    在数据库中通过teacherid字段查找并返回课程的所有信息
    */
    async CoursebyType(ctx){
        const coutype = ctx.request.query.coursetype;
        const docs = await Course.aggregate([{
                $match: {
                    coursetype:coutype,
                }
            }, {
                $lookup: {
                    from: "teachers",
                    localField: "teacherID",
                    foreignField: "id",
                    as: "teacher"
                }
            },{
                $project: {
                    _id:0,
                    __v:0,
                    teacher:{
                        _id:0,
                        __v:0,
                        password:0,
                        created:0,
                    }
                }
            }]
        )
        ctx.body=docs;
    },
    /*
    更改头像模块
    token中获取user id
    将上传的图片重命名后转移到新路径
    如果存在同名不同后缀的图片，需要进行删除
    返回{state/avatar}
     */
    async ChangeImg(ctx) {
        //拿到user的id
        //console.log(ctx.request.files);
        //const userid = ctx.state.user[0].id;
        const courseID = ctx.request.body.courseID;
        const img = ctx.request.files.file;//拿到file.avatar这个对象
        const extName = path.extname(img.name);//拓展名
        const name = `cou_${courseID + extName}`;
        const findResult = await Course.find({courseID: ctx.request.body.courseID});
        const Sourcepath = findResult[0].img;
        //console.log(name);
        //从原路径进行到新路径
        fs.renameSync(img.path, path.join(__dirname, `../static/img/course/${name}`));
        //
        await Course.updateOne({
            courseID: courseID
        }, {
            img: `/img/course/${name}`
        })
        //上传的图片格式不一样，即存在名为xx.png xx.jpg两种
        //需要删除原来的图片
        if (Sourcepath !== '/img/course/default.png' && path.extname(Sourcepath) !== extName) {
            fs.unlinkSync(path.join(__dirname, `../static${Sourcepath}`))
        }
        //fs.unlink(avatar.path);
        //const Newuser = await Student.find({id:userid});
        ctx.body = {
            state: true,
            img: `/img/course/${name}`,
        }
    }

}