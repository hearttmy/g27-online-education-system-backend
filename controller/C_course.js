const Course = require('../modules/courseInfo');
const Teacher = require('../modules/Teacher');
const Student = require('../modules/Student');
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

    async isSelect(ctx){
        const stuID = ctx.state.user[0].id;
        const courseID = ctx.request.query.courseID;
        const course = await Student.findOne({
            id : stuID,
            //"study.courseID" : courseID
        },{
            study:{$elemMatch:{
                courseID : courseID
            }}
        })
        //console.log(course.study.length());
        if(course.study===undefined){
            return ctx.body={state:false}
        }else{
            return ctx.body={state:true}
        }

    },

    async addStudent(ctx){
        const stuID = ctx.state.user[0].id;
        const courseID = ctx.request.query.courseID;
        console.log(ctx.state.user[0]);
        const course = await Student.findOne({
            id : stuID,
        },{
            study:{$elemMatch:{
                    courseID : courseID
                }}
        })
        if(course.study.length===0){
            await Student.updateOne({
                id:stuID,
                //"study.courseID" : courseID
            },{
                $push:{
                    study:{courseID}
                }
            }).then(()=>{
                ctx.body = {state:true}
            }).catch(err =>{
                ctx.body = {state:false,msg:err}
            })
            await Course.updateOne({
                courseID:courseID
            },{
                $push:{
                    students:stuID
                }
            })
        }else{
            return ctx.body={state:false}
        }
        //let re = await Student.find({id:stuID});
        //console.log(re);



    },


    async Search(ctx){
        let title = ctx.request.query.title;
        //console.log(ctx.request.query);
        let result = await Course.find({
            courseName:{$regex:title,$options:"$i"},
        })
        ctx.body = result;
    },

    /*
    设置课程状态 1:正在进行 0:已结课
     */
    async SetState (ctx){
        //console.log(couID)
        const couID = ctx.request.body.id;
        const couState = ctx.request.body.state;
        console.log(couState);
        await Course.updateOne({
            _id:couID}, {
                state: couState,
            }
        ).then(()=>{
            return ctx.body = {
                state : true,
            }
        }).catch(err => {
            console.log(err);
        });
    },
    /*
    添加课程
    需要token验证，传入课程名字，会自动生成相应的id编号。
    参数：Yead/Season/courseType
     */
    async addcourse (ctx) {
        //console.log(ctx.request.body);
        //const findResult = await Course.find({id: ctx.request.body.courseID});
        const teacherID = ctx.state.user[0].id;
        const courseID = uid.uid(16);
        //console.log(courseID);
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
    需要token验证
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
      新增章节
      需要token验证
      输入{courseID,ChapterName}
      输出{state}
   */
    async delChapter(ctx) {
        const {
            courseID,
            chapterID,
        } = ctx.request.body ;
        console.log(ctx.request.body);
        const tchid = ctx.state.user[0].id;
        const cou = await Course.find({courseID:courseID});
        if(cou[0].teacherID != tchid){
            return ctx.body = {state:false};
        }
        console.log(chapterID);
        console.log(cou[0]);
        await Course.updateOne({
            courseID:courseID
        },{
            $pull:{
                content:{
                    _id:chapterID
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
    需要token验证
    输入{CourseID/ChapterID/FileName}
    输出{state}
     */
    async AddFile(ctx){
        //console.log(ctx.request.body);
        const {
            courseID,
            chapterID,
            fileName,
        }=ctx.request.body;
        //验证是否为该门课的教师
        //console.log(ctx.state.user);
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
    添加课件
    需要token验证
    输入{CourseID/ChapterID/FileName}
    输出{state}
     */
    async DelFile(ctx){
        console.log(ctx.request.body);
        const {
            courseID,
            chapterID,
            fileName,
            fileUrl,
        }=ctx.request.body;
        //验证是否为该门课的教师
        console.log(ctx.state.user);
        const tchid = ctx.state.user[0].id;
        const cou = await Course.find({courseID:courseID});
        console.log(cou);
        if(cou[0].teacherID != tchid){
            return ctx.body = {state:false};
        }
        //const course = await Course.find({"courseID":courseID,"content._id":chapterID,"Filename":fileName});    //拿到文件对象
        const url = fileUrl;
        //const url = File.Fileurl;
        //console.log(File);
        //const extName = path.extname(File.name);//拓展名
        //const name = `cou_${chapterID + fileName}`;//文件名
        console.log(path.join('../static/',url));
        fs.unlink(path.join('../static/',url),err => {
            if(err) return ctx.body = {state:false,msg:err}
        })
        //fs.renameSync(File.path, path.join(__dirname, `../static/file/${name}`));
        await Course.updateOne({
            "courseID":courseID,
            "content._id":chapterID,
        },{
            $pull:{
                [`content.$.part`]:{
                    Filename: fileName,
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
    通过课程ID获得课程信息
    通过Get的query字段获得courseID
    在数据库中通过teacherid字段查找并返回课程的所有信息
     */
    async CoursebyID(ctx){
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
        const couType = ctx.request.query.type;
        if(couType==="全部课程"){
            let findResult = await Course.find({}).sort({courseName:1});
            //console.log(findResult);
            return ctx.body = findResult;
        }
        const docs = await Course.aggregate([{
                $match: {
                    courseType:couType,
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
    传入courseID即可
     */
    async ChangeImg(ctx) {
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

// async Test(ctx) {
//     let couID = "5feae1ef9b102c25207fba46" ;
//     let ChaID = "5feae8c4f87a21268d90876c" ;
//     let result = await Course.find({
//         _id:couID,
//         "content._id":ChaID
//     },{
//         content:{$elemMatch:{
//             //"part._id": "5feaea7a97246b27487ae4b3"
//             }}
//     })
//     console.log(result);
//     ctx.body= result;
//
// },