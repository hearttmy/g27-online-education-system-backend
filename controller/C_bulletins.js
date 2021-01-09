const Bulletins = require('../modules/bulletins');
const Student = require('../modules/Student');
const Course = require('../modules/courseInfo');
const Teacher = require('../modules/Teacher');
const ActivityStream = require('../modules/ActivityStream');
// let compare = function (){
//   return function (obj1,obj2){
//     let
//   }
// }
module.exports = {
  async addBulletins(ctx){
    const {
      courseID,
      title,
      content,
    }=ctx.request.body;

    const Bulletin = new Bulletins({
      courseID:courseID,
      title:title,
      content:content,
    })

    await Bulletin.save().then(()=>{
      ctx.body={state:true}
    }).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    });

    const cou = await Course.findOne({courseID:courseID});

    const ASteam = new ActivityStream({
      courseID:courseID,
      courseName:cou.courseName,
      title:title,
      type:"公告",
    })
    await ASteam.save().catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    });

  },

  async getBulletins(ctx){
    const {
      courseID,
    } = ctx.request.body;

    const docs = await Bulletins.find({
      courseID:courseID
    }).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    })

    ctx.body={state:true,Bulletins:docs}
  },

  async delBulletins(ctx){
    const {
      BulletinID
    } = ctx.request.body;

    await Bulletins.remove({
      _id:BulletinID
    }).then(()=>{
      ctx.body={state:true}
    }).catch(err=>{
      ctx.body={stata:false,errMsg:err.message}
    })
  },

  async MyBulletins(ctx){

    const user = ctx.state.user[0];
    let MyBu ,result;
    if(user.type == "0"){
      const stu = await Student.findOne({id:user.id})
      const MyQuery = stu.study.map(item=>{
        return `\{\"courseID\"`+":"+`\"${item.courseID}\"\}`
      })
      const Query = String(MyQuery[0]);
      result = await Promise.all(stu.study.map(async(item)=>{
        let re = await ActivityStream.find({
          courseID:item.courseID
        })
        console.log(re);
        return re;
      }))

    }else if(user.type == "1"){
        const Tea = await Teacher.findOne({id:user.id})
        const MyQuery = Tea.teach.map(item=>{
          return `\{\"courseID\"`+":"+`\"${item.courseID}\"\}`
        })
        const Query = String(MyQuery[0]);
        console.log(Tea);
        result = await Promise.all(Tea.teach.map(async(item)=>{
          console.log(item.courseID);
          let re = await ActivityStream.find({
            courseID:item.courseID
          })
          return re;
        }))
    }

    let List=[];
    result.forEach((item)=>{
      item.forEach((subItem)=>{
        List.push(subItem);
      })
    })
    List.sort(function(a, b) {
      return new Date(a.date) - new Date(b.date)
    });

    return ctx.body={state:true,result:List};


  }

}

