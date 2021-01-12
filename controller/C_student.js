//const Router = require('koa-router');
//const router = new Router();
const Student = require('../modules/Student');
const bcrypt = require('bcryptjs');
const tool = require('../config/tool');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');
const passport = require('koa-passport');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable=require('formidable');

module.exports = {
  //隐藏的APi
  async Fuck(ctx) {
    ctx.status=200;
    ctx.body = {msg :'What the Fuck?'};
  },
  /*
  注册模块
  判断id唯一性
  若id重复 在state字段返回false
  若注册成功 state字段返回true
   */
  async Register(ctx) {
    //id查重
    const findResult = await Student.find({id: ctx.request.body.id});
    //返回state :false
    if(findResult.length>0){
      ctx.body = {state:false};
    }else{
      const newStudent = new Student({
        username: ctx.request.body.username,
        id: ctx.request.body.id,
        password: tool.enbcrypt(ctx.request.body.password),
        email:ctx.request.body.email,
        realName:ctx.request.body.realName,
      })

      await newStudent.save().then(user =>{
        ctx.body = {state:true};
        console.log(newStudent);
      }).catch(err => {
        console.log(err);
      });
    }

  },

  /*
  登陆模块
  判断注册stuid唯一性
  若stuid重复 在state字段返回false
  登陆成功后返回
  {
      state:true,
      token:"",
      user : 所有信息（含密码，需要改）
  }
  否则返回 state:false
   */
  async Login(ctx){
    //查找记录
    let findResult = await Student.find({id: ctx.request.body.id});
    console.log(ctx.request.body);
    const password = ctx.request.body.password;
    const user = findResult[0];
    if(findResult.length === 0){
      return ctx.body = {state:false};
    }else{
      let result = await bcrypt.compareSync(password, user.password);
      //返回 token
      const payload = {
        id : user.id,
        _id : user._id,
        avatar : user.avatar,
        username : user.username,
        type : user.type,
      };
      const token = jwt.sign(payload,keys.secretTokenKey,{expiresIn: 3600*24*7});
      if(result){
        ctx.body = {state:true, token:"Bearer "+token , user : user};
      }else{
        ctx.body = {state:false};
      }
    }
  },

  async ChangePwd(ctx){
    let findResult = await Student.find({id: ctx.state.user[0].id});
    const newPwd = ctx.request.body.newPwd;
    const oldPwd = ctx.request.body.oldPwd;
    const user = findResult[0];
    //password: tool.enbcrypt(ctx.request.body.password)
    if(findResult.length === 0){
      return ctx.body = {state:false};
    }else{
      let result = await bcrypt.compareSync(oldPwd, user.password);
      if(result){
        await Student.updateOne({
          id:user.id
        }, {
          password: tool.enbcrypt(newPwd)
        })
        ctx.body = {state:true};
      }else{
        ctx.body = {state:false,msg:"wrong pwd"};
      }
    }
  },


  async ChangeInfo(ctx){
    const userid = ctx.state.user[0].id;
    const realName= ctx.request.body.realName;
    const username= ctx.request.body.username;
    const gender = ctx.request.body.gender;
    const phone = ctx.request.body.phone;
    let state;
    let stu = await Student.updateOne({
      id:userid,
    },{
      realName:realName,
      username:username,
      gender:gender,
      phone:phone,
    }).then(()=>{
      state = true
    }).catch(err => {
      state = false
    })
    let newUser = await Student.find({id: ctx.state.user[0].id});
    ctx.body={state,user:newUser[0]};
  },

  /*
  更改头像模块
  token中获取user id
  将上传的图片重命名后转移到新路径
  如果存在同名不同后缀的图片，需要进行删除
  返回{state/avatar}
   */
  async ChangeAvatar(ctx) {
    //拿到user的id
    //console.log(ctx.request.files);
    const userid = ctx.state.user[0].id;
    const avatar = ctx.request.files.file;//拿到file.avatar这个对象
    const extName = path.extname(avatar.name);
    const name = `stu_${userid + extName}`;
    //console.log(name);
    //从原路径进行到新路径
    fs.renameSync(avatar.path, path.join(__dirname, `../static/img/avatar/${name}`));
    //
    await Student.updateOne({
      id: userid
    }, {
      avatar: `/img/avatar/${name}`
    })
    //上传的图片格式不一样，即存在名为xx.png xx.jpg两种
    //需要删除原来的图片
    // if (ctx.state.user[0].avatar !== '/img/avatar/default.png' && path.extname(ctx.state.user[0].avatar) !== extName) {
    //     fs.unlinkSync(path.join(__dirname, `../static${ctx.state.user[0].avatar}`))
    // }
    //fs.unlink(avatar.path);
    //const Newuser = await Student.find({id:userid});
    ctx.body = {
      state: true,
      avatar: `/img/avatar/${name}`,
    }
  }
}

