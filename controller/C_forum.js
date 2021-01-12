const forumPost = require('../modules/forum');
const PostReply = require('../modules/postReply');
const Course = require('../modules/courseInfo');
const mongoose = require('mongoose');
module.exports = {
  async addPost(ctx){
    const {
      title,
      content,
      courseID
    }=ctx.request.body;
    const user = ctx.state.user[0];

    const Post = new forumPost({
      userType:user.type,
      userID:user.id,
      courseID:courseID,
      postTitle:title,
      content:content,
    })

    await Post.save().then(()=>{
      ctx.body={state:true}
    }).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    })

  },

  async getPost(ctx){
    const {
      courseID
    }=ctx.request.body;

    const docs = await forumPost.aggregate([{
      $match:{courseID:courseID}
    },{
      $lookup:{
        from:"students",
        localField: "userID",
        foreignField: "id",
        as:"student"
      }
    }, {
      $project: {
        __v: 0,
        student: {
          _id: 0,
          __v: 0,
          password: 0,
          created: 0,
          study: 0,
          date: 0,
          email: 0,
          phone: 0,
          gender: 0,
          type: 0,
        }
      }
    }, {
      $lookup: {
        from: "teachers",
        localField: "userID",
        foreignField: "id",
        as: "teacher"
      }
    }, {
      $project: {
        teacher: {
          _id: 0,
          __v: 0,
          password: 0,
          created: 0,
          teach: 0,
          date: 0,
          email: 0,
          phone: 0,
          gender: 0,
          type: 0,
        }
      }
    }])
      .catch(err=>{
        return ctx.body={state:false,errMsg:err.message}
      })
    ctx.body={state:true,Posts:docs};
  },

  async getMyPost(ctx){
    const {
      courseID
    }=ctx.request.body;
    const user=ctx.state.user[0];

    const docs = await forumPost.aggregate([{
      $match:{
        courseID:courseID,
        userID:user.id
      }
    },{
      $lookup:{
        from:"students",
        localField: "userID",
        foreignField: "id",
        as:"student"
      }
    }, {
      $project: {
        __v: 0,
        student: {
          _id: 0,
          __v: 0,
          password: 0,
          created: 0,
          study: 0,
          date: 0,
          email: 0,
          phone: 0,
          gender: 0,
          type: 0,
        }
      }
    }, {
      $lookup: {
        from: "teachers",
        localField: "userID",
        foreignField: "id",
        as: "teacher"
      }
    }, {
      $project: {
        teacher: {
          _id: 0,
          __v: 0,
          password: 0,
          created: 0,
          teach: 0,
          date: 0,
          email: 0,
          phone: 0,
          gender: 0,
          type: 0,
        }
      }
    }]).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    })

    ctx.body={state:true,Posts:docs};

  },

  async delPost(ctx){
    const {
      //courseID,
      postID
    }=ctx.request.body;

    // const cou = await Course.findOne({courseID:courseID});
    // if(cou.teacherID !== ctx.state.user[0].id){
    //     return ctx.body={state:false,errMsg:"非本课程教师"}
    // }

    await forumPost.remove({
      _id:postID,
    }).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    })

    await PostReply.remove({
      postID:postID,
    }).catch(err=>{
      ctx.body={state:false,errMsg:err.message}
    })

    return ctx.body={state:true}
  },

  async replyPost(ctx){
    const {
      postID,
      content
    }=ctx.request.body;
    const user = ctx.state.user[0];

    const reply = new PostReply({
      userType:user.type,
      userID:user.id,
      postID:postID,
      content:content
    })

    await reply.save().catch(err=>{
      ctx.body={state:false,errMes:err.message}
    })

    const Post = await forumPost.findById(postID);
    let Num = Post.numOfReply + 1;

    await forumPost.updateOne({
      _id: postID,
    }, {
      numOfReply: Num,
    })

    ctx.body={state:true};
  },

  async getReply(ctx){
    const {
      postID,
    }=ctx.request.body;
    const Post = await forumPost.aggregate([{
      $match:{
        _id:mongoose.Types.ObjectId(postID)
      }
    },{
      $lookup:{
        from:"students",
        localField: "userID",
        foreignField: "id",
        as:"student"
      }
    }, {
      $project: {
        __v: 0,
        student: {
          _id: 0,
          __v: 0,
          password: 0,
          created: 0,
          study: 0,
          date: 0,
          email: 0,
          phone: 0,
          gender: 0,
          type: 0,
        }
      }
    }, {
      $lookup: {
        from: "teachers",
        localField: "userID",
        foreignField: "id",
        as: "teacher"
      }
    }, {
      $project: {
        teacher: {
          _id: 0,
          __v: 0,
          password: 0,
          created: 0,
          teach: 0,
          date: 0,
          email: 0,
          phone: 0,
          gender: 0,
          type: 0,
        }
      }
    }])

    const docs = await PostReply.aggregate([{
      $match:{postID:postID}
    },{
      $lookup:{
        from:"students",
        localField: "userID",
        foreignField: "id",
        as:"student"
      }
    }, {
      $project: {
        __v: 0,
        student: {
          _id: 0,
          __v: 0,
          password: 0,
          created: 0,
          study: 0,
          date: 0,
          email: 0,
          phone: 0,
          gender: 0,
          type: 0,
        }
      }
    }, {
      $lookup: {
        from: "teachers",
        localField: "userID",
        foreignField: "id",
        as: "teacher"
      }
    }, {
      $project: {
        teacher: {
          _id: 0,
          __v: 0,
          password: 0,
          created: 0,
          teach: 0,
          date: 0,
          email: 0,
          phone: 0,
          gender: 0,
          type: 0,
        }
      }
    }]).catch(err=>{
      ctx.body={state:false,errMsg:err.message};
    })
    ctx.body={state:true,Post:Post,replies:docs};
  }
}
