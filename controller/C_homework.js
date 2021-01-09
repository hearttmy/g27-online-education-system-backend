const Course = require('../modules/courseInfo');
const Student = require('../modules/Student');
const Group = require('../modules/courseGroup');
const Homework = require('../modules/Homework');
const HWSubmission = require('../modules/HWsubmission');
const ActivityStream = require('../modules/ActivityStream');
const Grade = require('../modules/grade');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const path = require('path');

async function getHWGrade(ctx) {

  const {
    courseID,
    stuID
  } = ctx;

  let HWGrade = 0;
  const group = await Group.findOne({courseID:courseID,stuID:stuID});
  const groupID = group._id;

  const HW = await Homework.find({
    courseID: courseID
  })

  await Promise.all(HW.map(async (item) => {
    if(item.type==="小组作业"){
      let re = await HWSubmission.find({hwID: item._id, stuID: groupID})
      if (re.length === 0) ;
      else {
        if (re[0].grade >= 0) HWGrade += re[0].grade * item.proportion / 100;
      }
    }else{
      let re = await HWSubmission.find({hwID: item._id, stuID: stuID})
      if (re.length === 0) ;
      else {
        if (re[0].grade >= 0) HWGrade += re[0].grade * item.proportion / 100;
      }
    }
  }))
  await Grade.updateOne({
    courseID:courseID,
    stuID:stuID
  },{
    hwScore:HWGrade,
  })
  return ctx.body={state:true,HWGrade:HWGrade};
  console.log(HWGrade);

}

module.exports = {

  async test(ctx){
    await Student.updateOne({
      id:"admin"
    },{
      type:"2"
    }).then(()=>{
      return ctx.body=true
    })
  },
  /*
  获得成绩
   */
  async getGrade(ctx){
    const {
      courseID
    } = ctx.request.body;
    const stu = ctx.state.user[0];

    let stuGrade= await Grade.aggregate([
      {
        $match:{
          courseID:courseID,
          stuID:stu.id
        }
      },{
        $lookup:{
          from:"students",
          localField: "stuID",
          foreignField: "id",
          as:"stu"
        }
      },{
        $project: {
          hwScore:1,
          finalScore:1,
          stu: {
            id:1,
            realName:1,
          }
        }
      }
    ])

    return ctx.body={state:true,Grade:stuGrade}
  },

  async getAllGrade(ctx){
    const {
      courseID
    } = ctx.request.body;

    let stuGrade = await Grade.aggregate([
      {
        $match:{courseID:courseID}
      },{
        $lookup:{
          from:"students",
          localField: "stuID",
          foreignField: "id",
          as:"stu"
        }
      },{
        $project: {
          hwScore:1,
          finalScore:1,
          _id:1,
          stu: {
            id:1,
            realName:1,
          }
        }
      }
    ])

    return ctx.body={state:true,stuGrade}
  },


  async SetExamGrade(ctx){
    const {
      gradeID,
      grade,
      //stuID,
      //courseID
    } = ctx.request.body;

    await Grade.updateOne({
      _id:gradeID,
    },{
      finalScore:grade
    }).then(()=>{
      ctx.body = {state:true}
    }).catch(err=>{
      ctx.body = {state:false,errMsg:err.message}
    })
  },

  /*
  根据课程ID得到该课程的所有作业
  input  { courseID }
  output { state , HW }
   */
  async getHW(ctx){
    const{
      courseID,
    }=ctx.request.query;
    const result = await Homework.find({
      courseID:courseID,
    }).catch(err=>{
      return ctx.body={state:false,msg:err.msg};
    })

    // let NumOfStu = cou.students.length ;
    //const NumOfStudents = await NumOfStu(courseID);
    //console.log(NumOfStudents) ;
    ctx.body={state:true,HW:result};
  },

  /*
  新增作业
  Input: { courseID / hwName / description / beginDate / deadline / proportion / type }
  Output:{ state }
   */
  async newHW(ctx) {
    const {
      courseID,
      hwName,
      description,
      beginDate,
      deadline,
      proportion,
      type
    }=ctx.request.body;

    const newHW = new Homework({
      courseID:courseID,
      hwName: hwName,
      description: description,
      proportion:proportion,
      type:type,
      beginDate: new Date(beginDate),
      deadline: new Date(deadline),
    })

    await newHW.save().then(() => {
      ctx.body = {state: true};
    }).catch(err => {
      ctx.body = {state: false, msg:err};
    });

    const cou = await Course.findOne({courseID:courseID});
    const ASteam = new ActivityStream({
      courseID:courseID,
      courseName:cou.courseName,
      title:hwName,
      type:"作业"
    })
    await ASteam.save().catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    });

  },

  /*
  删除作业
  Input: { hwID }
  Output:{ state }
   */
  async DelNewHW(ctx) {
    const {
      hwID
    }=ctx.request.body;

    await Homework.remove({
      _id:hwID
    }).then(()=>{
      ctx.body = {state:true}
    }).catch(err=>{
      ctx.body = {state:false,err:err.message}
    })
  },

  /*
  添加作业附件
  Input: { courseID / hwID }
  Output:{ state }
   */
  async fileToHW(ctx){
    const {
      courseID,
      hwID,
    }=ctx.request.body;
    //如果不存在该文件的目录，那么创建
    if (!fs.existsSync(path.join(__dirname, `../static/homework/${hwID}`))) {
      fs.mkdirSync(path.join(__dirname, `../static/homework/${hwID}`));
    }
    const File = ctx.request.files.file;        //拿到文件对象
    const name = `${File.name}`;       //文件名
    fs.renameSync(File.path, path.join(__dirname, `../static/homework/${hwID}/${name}`));

    await Homework.updateOne({
      _id:hwID,
    },{
      $push:{
        File: {
          fileName : name,
          fileUrl : `/homework/${hwID}/${name}`,
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
  删除作业附件
  Input: { hwID / fileName }
  Output:{ state }
   */
  async delHWFile(ctx){
    const {
      hwID,
      fileName,
      fileUrl
    }=ctx.request.body;

    fs.unlink(path.join('../static/',fileUrl),err => {
      if(err) return ctx.body = {state:false,msg:err}
    })

    await Homework.updateOne({
      "_id":hwID,
    },{
      $pull:{
        File:{
          fileName: fileName,
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
      学生提交作业
      input:{ token , hwID }
      output:{ state }
   */
  async submitHW(ctx){
    let stuID = ctx.state.user[0].id;
    const hwID = ctx.request.body.hwID;
    const HW = await Homework.findById(hwID);

    if(HW.type==="小组作业"){
      const courseID = HW.courseID;
      const group = await Group.findOne({courseID:courseID,stuID:stuID});
      stuID=group._id;
    }

    if (!fs.existsSync(path.join(__dirname, `../static/homework/${hwID}`))) {
      fs.mkdirSync(path.join(__dirname, `../static/homework/${hwID}`));
    }
    if (!fs.existsSync(path.join(__dirname, `../static/homework/${hwID}/submission`))) {
      fs.mkdirSync(path.join(__dirname, `../static/homework/${hwID}/submission`));
    }

    const docs = await HWSubmission.find({
      stuID:stuID,
      hwID:hwID
    }).catch(err => {
      return ctx.body = {state:false,errMsg:err.message}
    });

    if(docs.length===0) {

      const File = ctx.request.files.file;        //拿到文件对象
      const name = `${File.name}`;                //文件名
      let fullName = stuID + '_' + name;
      fs.renameSync(File.path, path.join(__dirname, `../static/homework/${hwID}/submission/${fullName}`));

      //更新作业提交情况
      const HW = await Homework.findById(hwID);
      let Num = HW.NumOfSub + 1;

      await Homework.updateOne({
        _id: hwID,
      }, {
        NumOfSub: Num,
      })

      let Submission = new HWSubmission({
        stuID: stuID,
        hwID: hwID,
        fileName: fullName,
        fileUrl: `/homework/${hwID}/submission/${fullName}`
      })

      await Submission.save().then(() => {
        ctx.body = {state: true};
      }).catch(err => {
        ctx.body = {state: false, errMsg: err.message}
      });

    }else{
      ctx.body = {state:false, errMsg: "您已提交过作业"}
    }
  },

  /*
  学生删除已提交的作业
  input:{ fileName , fileUrl , hwID }
  output:{ state }
  */
  async delSubmitHW(ctx) {
    const {
      fileName,
      fileUrl,
      hwID
    }=ctx.request.body;

    fs.unlink(path.join('../static/',fileUrl),err => {
      if(err) return ctx.body = {state:false,msg:err}
    })

    await HWSubmission.remove({
      fileName: fileName,
      fileUrl: fileUrl
    }).then(()=>{
      ctx.body = {state:true}
    }).catch(err=>{
      ctx.body = {state:false,err:err.message}
    })

    const HW = await Homework.findById(hwID);
    let Num = HW.NumOfSub - 1 ;

    await Homework.updateOne({
      _id: hwID,
    }, {
      NumOfSub: Num,
    })

  },

  async getSubmit(ctx){
    const hwID = ctx.request.query.hwID;
    const HW = await Homework.findById(hwID);
    let docs;
    if(HW.type === "小组作业"){
      docs = await HWSubmission.aggregate([
        {
          $match:{
            hwID:hwID
          }
        },{
          $lookup:{
            from:"students",
            localField: "stuID",
            foreignField: "id",
            as:"stu"
          }
        }, {
          "$addFields":
            {
              "stuID": { "$toObjectId": "$stuID" }
            }
        },{
          $lookup:{
            from:"cougroups",
            localField:"stuID",
            foreignField: "_id",
            as:"group"
          }
        },{
          $project:{
            __v:0,
            group:{
              _id:0,
              __v:0,
            }
          }
        }
      ])
    }
    else {
      docs = await HWSubmission.aggregate([{
          $match:{
            hwID:hwID
          }
        },{
          $lookup:{
            from:"students",
            localField: "stuID",
            foreignField: "id",
            as:"stu"
          }
        },{
          $project:{
            __v:0,
            stu:{
              _id:0,
              __v:0,
              password:0,
              created:0,
              study:0,
              date:0,
              avatar:0,
              email:0,
              phone:0,
              gender:0,
              type:0,
            }
          },
        }]
      ).catch(err => {
        return ctx.body = {state:false,errMsg:err.message}
      })
    }
    console.log(HW);
    ctx.body = { state:true, HW : docs }
  },

  async MySubmit(ctx){
    let stuID = ctx.state.user[0].id;
    const hwID = ctx.request.query.hwID;
    const HW = await Homework.findOne({_id:hwID});
    if(HW.type==="小组作业"){
      const courseID = HW.courseID;
      const group = await Group.findOne({courseID:courseID,stuID:stuID});
      stuID=group._id;
    }
    const docs = await HWSubmission.find({
      stuID:stuID,
      hwID:hwID
    }).catch(err => {
      return ctx.body = {state:false,errMsg:err.message}
    });
    ctx.body = { state:true, HW : docs }
  },

  async setGrade(ctx){
    const {
      grade,
      hwID,
      comment,
    } = ctx.request.body;

    const HWsub = await HWSubmission.findById(hwID);
    const HW = await Homework.findById(HWsub.hwID);
    //console.log(ctx.request.body);
    await HWSubmission.updateOne({
      _id:hwID,
    },{
      grade:grade,
      comment:comment,
    }).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    })

    if(HW.type === "小组作业"){
      const group = await Group.findById(HWsub.stuID);
      group.stuID.map(async(item)=>{
        const info = {courseID:HW.courseID,stuID:item};
        await getHWGrade(info);
      })
    }
    else{
      const info = {courseID:HW.courseID,stuID:HWsub.stuID};
      await getHWGrade(info);
    }


    return ctx.body={state:true};

  },

  async IsSubmit(ctx){
    const stuID = ctx.state.user[0].id;
    const courseID = ctx.request.query.courseID;
    const group = await Group.findOne({courseID:courseID,stuID:stuID});

    let HW = await Homework.find({courseID:courseID});

    let r = await Promise.all( HW.map(async (item)=>{
      let isSelect=0,grade=0;
      if(item.type === "小组作业"){
        let re = await HWSubmission.find({hwID:item._id,stuID:group._id})
        if(re.length===0) isSelect=0;
        else{
          isSelect=1;
          grade=re[0].grade;
        }
      }else{
        let re = await HWSubmission.find({hwID:item._id,stuID:stuID})
        //console.log(re);
        if(re.length===0) isSelect=0;
        else{
          isSelect=1;
          grade=re[0].grade;
        }
      }
      return [ isSelect, grade ];
    }));

    ctx.body = { state:true, isSubmit : r }
  },

}
