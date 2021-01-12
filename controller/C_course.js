const Course = require('../modules/courseInfo');
const Teacher = require('../modules/Teacher');
const grade = require('../modules/grade');
const ActivityStream = require('../modules/ActivityStream');
const Student = require('../modules/Student');
const fs = require('fs');
const path = require('path');
const uid = require('uid');

module.exports = {
  async allInfo(ctx){
    const findResult = await Course.aggregate( [
      {
        $lookup: {
          from: "teachers",
          localField: "teacherID",
          foreignField: "id",
          as: "teacher"
        },
      }, {
        $project: {
          __v: 0,
          students: 0,
          created: 0,
          content: 0,
          teacher: {
            __v: 0,
            _id: 0,
            teach: 0,
            password: 0,
          }
        }
      },
      {
        $sample:
          { size: 8 }
      }
    ] )
    ctx.body = findResult;
  },
  async isTA(ctx){
    const{
      courseID
    } = ctx.request.body;
    const user = ctx.state.user[0];

    const course = await Course.findOne({
      courseID : courseID,
    },{
      TA:{
        $elemMatch:{
          ID : user.id
        }
      }
    })

    if(course.TA.length===0){
      return ctx.body={state:false}
    }else{
      return ctx.body={state:true}
    }

  },

  async addTA(ctx){
    const {
      courseID,
      TA_ID,
    } = ctx.request.body;
    console.log(ctx.request.body);
    await Course.updateOne({
      courseID:courseID,
    },{
      $push: {
        TA:{
          ID:TA_ID,
        }
      }
    }).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    })

    ctx.body={state:true}

  },
  /*
  获得我的课程
  token
   */
  async myCourse(ctx){
    const user = ctx.state.user[0];
    let couList,Cou,TAcou;
    if(user.type == "0"){
      const Stu = await Student.findOne({id:user.id});
      Cou = Stu.study;
    }
    else if(user.type == "1"){
      const Tea = await Teacher.findOne({id:user.id});
      Cou = Tea.teach;
    }

    couList = await Promise.all(Cou.map(async (item)=>{
      let course = await Course.aggregate([
        {
          $match:{
            courseID: item.courseID
          }
        },{
          $lookup: {
            from: "teachers",
            localField: "teacherID",
            foreignField: "id",
            as: "teacher"
          },
        },{
          $project:{
            __v: 0,
            students:0,
            created:0,
            content:0,
            teacher:{
              __v:0,
              _id:0,
              teach:0,
              password:0,
            }
          }
        }
      ])
      return course[0];
    }))
    TAcou =  await Course.aggregate([
      {
        $match:{
          TA:{
            $elemMatch:{
              ID : user.id
            }
          }
        }
      },{
        $lookup: {
          from: "teachers",
          localField: "teacherID",
          foreignField: "id",
          as: "teacher"
        },
      }, {
        $project: {
          __v: 0,
          TA:0,
          _id:0,
          students: 0,
          created: 0,
          content: 0,
          teacher: {
            __v: 0,
            _id: 0,
            teach: 0,
            password: 0,
          }
        }
      }
    ])

    return ctx.body={state:true,info:couList,TAcou:TAcou};
  },
  /*
  是否为这门课的老师
   */
  async isTeacher(ctx){
    const teaID = ctx.state.user[0].id;

    const cou = await Course.findOne({
      courseID:ctx.request.query.courseID,
    })

    if(cou.teacherID === teaID){
      return ctx.body = {state:true}
    }else{
      return ctx.body = {state:false}
    }
  },
  /*
  是否选了这门课
   */
  async isSelect(ctx){
    const stuID = ctx.state.user[0].id;
    const courseID = ctx.request.query.courseID;

    const course = await Student.findOne({
      id : stuID,
    },{
      study:{$elemMatch:{
          courseID : courseID
        }}
    })

    if(course.study.length===0){
      return ctx.body={state:false}
    }else{
      return ctx.body={state:true}
    }
  },
  /*
  添加学生
   */
  async addStudent(ctx){

    const stuID = ctx.state.user[0].id;
    const courseID = ctx.request.query.courseID;

    const course = await Student.findOne({
      id : stuID,
    },{
      study:{
        $elemMatch:{
          courseID : courseID
        }
      }
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
        ctx.body = {state:false,msg:err.message}
      })

      await Course.updateOne({
        courseID:courseID
      },{
        $push:{
          students:stuID
        }
      })

      const stuGrade = new grade({
        courseID:courseID,
        stuID:stuID,
      })

      await stuGrade.save();

    }else{
      return ctx.body={state:false}
    }


  },
  /*
  全局搜索
   */
  async Search(ctx){
    let title = ctx.request.query.title;
    //console.log(ctx.request.query);
    let result = await Course.aggregate([
      {
        $match: {
          courseName: {$regex: title, $options: "$i"}
        }
      }, {
        $lookup: {
          from: "teachers",
          localField: "teacherID",
          foreignField: "id",
          as: "teacher"
        },
      }, {
        $project: {
          __v: 0,
          TA:0,
          _id:0,
          students: 0,
          created: 0,
          content: 0,
          teacher: {
            __v: 0,
            _id: 0,
            teach: 0,
            password: 0,
          }
        }
      }])
    ctx.body = result;
  },

  /*
  设置课程状态 1:正在进行 0:已结课
   */
  async SetState (ctx){
    //console.log(couID)
    const couID = ctx.request.body.id;
    const couState = ctx.request.body.state;
    //console.log(couState);
    await Course.updateOne({
        _id:couID}, {
        state: couState,
      }
    ).then(()=>{
      return ctx.body = {
        state : true,
      }
    }).catch(err => {
      return ctx.body = {
        state : true, errMsg:err.message
      }
      //console.log(err);
    });
  },
  /*
  添加课程
  需要token验证，传入课程名字，会自动生成相应的id编号。
  参数：Yead/Season/courseType
   */
  async addcourse (ctx) {
    const {
      courseName,
      courseType,
      faculty,
      Year,
      Season,
    }=ctx.request.body;
    const teacherID = ctx.state.user[0].id;
    const courseID = uid.uid(16);

    const newCourse = new Course({
      courseName: courseName,
      courseID: courseID,
      DurationTime: Year + Season,
      faculty:faculty,
      teacherID: teacherID,
      courseType: courseType,
    })

    await Teacher.updateOne({
      id:teacherID
    },{
      $push:{
        teach:{
          courseID
        }
      }
    })

    await newCourse.save().then(user => {
      ctx.body = {state: true};
    }).catch(err => {
      ctx.body = {state: true,errMsg:err.message}
    });
  },

  /*
  新增章节
  需要token验证[不需要]
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

    //if(cou[0].teacherID != tchid){
    //    return ctx.body = {state:false};
    //}

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
    删除章节
    需要token验证[取消]
    输入{courseID,ChapterName}
    输出{state}
 */
  async delChapter(ctx) {
    const {
      courseID,
      chapterID,
    } = ctx.request.body ;
    //console.log(ctx.request.body);
    const tchid = ctx.state.user[0].id;
    const cou = await Course.find({courseID:courseID});
    //if(cou[0].teacherID != tchid){
    //    return ctx.body = {state:false};
    //}
    //console.log(chapterID);
    //console.log(cou[0]);
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
  需要token验证[取消]
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
    // const tchid = ctx.state.user[0].id;
    // const cou = await Course.find({courseID:courseID});
    // if(cou[0].teacherID != tchid){
    //     return ctx.body = {state:false};
    // }

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

    const cou = await Course.findOne({courseID:courseID});
    const ASteam = new ActivityStream({
      courseID:courseID,
      courseName:cou.courseName,
      title:fileName,
      type:"课件",
    })
    await ASteam.save().catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    });

  },

  /*
  删除课件
  需要token验证[取消]
  输入{CourseID/ChapterID/FileName}
  输出{state}
   */
  async DelFile(ctx){
    //console.log(ctx.request.body);
    const {
      courseID,
      chapterID,
      fileName,
      fileUrl,
    }=ctx.request.body;
    //验证是否为该门课的教师

    // const tchid = ctx.state.user[0].id;
    // const cou = await Course.find({courseID:courseID});
    //
    // if(cou[0].teacherID != tchid){
    //     return ctx.body = {state:false};
    // }
    //const course = await Course.find({"courseID":courseID,"content._id":chapterID,"Filename":fileName});    //拿到文件对象
    const url = fileUrl;

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
    const docs = await Course.aggregate([
      {
        $match: {courseID:couID}
      }, {
        $lookup: {
          from: "teachers",
          localField: "teacherID",
          foreignField: "id",
          as: "teacher"
        },
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
      },{
        $lookup: {
          from :"students",
          localField :"students",
          foreignField:"id",
          as:"studentInfo"
        }
      },{
        $project:{
          studentInfo:{
            _id:0,
            __v:0,
            password:0,
            created:0,
          },
        }
      }]
    ).catch(err=>{
      ctx.body={state:false,msg:err}
    })

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
      let findResult = await Course.aggregate([
        {
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
            content:0,
            teacher:{
              _id:0,
              __v:0,
              password:0,
              created:0,
            }
          }
        }]).sort({courseName:1});

      return ctx.body = {state:true,docs:findResult};
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
    console.log(docs)
    ctx.body={state:true,docs:docs};
  },
  /*
  修改课程信息
   */
  async changeInfo(ctx){
    const {
      courseID,
      content
    }=ctx.request.body;

    await Course.updateOne({
      courseID:courseID
    },{
      information:content
    }).then(()=>{
      ctx.body={state:true}
    }).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    })
  },

  /*
  更改课程图像
  将上传的图片重命名后转移到新路径
  如果存在同名不同后缀的图片，需要进行删除
  返回{state/avatar}
   */
  async changeImg(ctx) {
    const courseID = ctx.request.body.courseID;
    const img = ctx.request.files.file;
    const name = `${img.name}`;
    let fullName = courseID + '_' + name;

    //从原路径进行到新路径
    fs.renameSync(img.path, path.join(__dirname, `../static/img/course/${fullName}`));

    await Course.updateOne({
      courseID: courseID
    }, {
      img: `/img/course/${fullName}`
    }).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    })
    ctx.body = {
      state: true,
      avatar: `/img/course/${fullName}`,
    }
  }
}
