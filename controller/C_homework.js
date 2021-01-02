const Course = require('../modules/courseInfo');
const Homework = require('../modules/Homework');
const fs = require('fs');
const path = require('path');

module.exports = {

    async getHW(ctx){
        const{
            courseID,
        }=ctx.request.query;
        const result = await Homework.find({
            courseID:courseID,
        }).catch(err=>{
            return ctx.body={state:false,msg:err.msg};
        })
        ctx.body={state:true,HW:result};
    },

    /*
    添加课程
    需要token验证，传入课程名字，会自动生成相应的id编号。
    参数：Year/Season/courseType
     */
    async newHW(ctx) {
        const {
            courseID,
            hwName,
            description,
            beginDate,
            deadline,
        }=ctx.request.body;
        // const teacherID = ctx.state.user[0].id;
        // const courseID = ctx.request.body.courseID;
        // const cou = await Course.find({courseID:courseID});
        // if(cou[0].teacherID != teacherID){
        //     return ctx.body = {state:false,"非此门课任课老师"};
        // }

        const newHW = new Homework({
            courseID:courseID,
            hwName: hwName,
            description: description,
            beginDate: new Date(beginDate),
            deadline: new Date(deadline),
        })

        await newHW.save().then(user => {
                ctx.body = {state: true};
            }).catch(err => {
                ctx.body = {state: false, msg:err};
            });
        },

    async fileToHW(ctx){
        const {
            courseID,
            hwID,
        }=ctx.request.body;
        //如果不存在该文件的目录，那么创建
        if (!fs.existsSync(path.join(__dirname, `../static/homework/${hwID}`))) {
            fs.mkdirSync(path.join(__dirname, `../static/homework/${hwID}`));
        }
        // const tchID = ctx.state.user[0].id;
        // const cou = await Course.find({courseID:courseID});
        // if(cou[0].teacherID != tchid){
        //     return ctx.body = {state:false};
        // }
        const File = ctx.request.files.file;        //拿到文件对象
        const extName = path.extname(File.name);    //拓展名
        const name = `${File.name}`;       //文件名
        let fullName = name + extName;
        fs.renameSync(File.path, path.join(__dirname, `../static/homework/${hwID}/${fullName}`));

        await Homework.updateOne({
            _id:hwID,
        },{
            $push:{
                File:{
                    Filename: fullName,
                    fileUrl:`/homework/${hwID}/${fullName}`,
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

}
