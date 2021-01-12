const Student = require('../modules/Student');
const Teacher = require('../modules/Teacher');
const Admin = require('../modules/Admin');
const Redis = require('koa-redis');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const tool = require('../config/tool');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const check = {};
const Store = new Redis().client

module.exports = {
  async isAdmin(ctx){
    const user=ctx.state.user[0];
    if(user.type==3) return ctx.body={state:true};
    else return {state:false};
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
    const type = ctx.request.body.userType;
    let findResult;
    if(type == 0) {
      findResult = await Student.find({id: ctx.request.body.id});
    } else if(type == 1 ) {
      findResult = await Teacher.find({id: ctx.request.body.id});
    } else if(type == 2 ) {
      findResult = await Student.find({id: ctx.request.body.id});
    }
    const password = ctx.request.body.password;
    if(findResult.length === 0){
      return ctx.body = {state:false};
    }else{
      const user = findResult[0];
      let result = await bcrypt.compareSync(password, user.password);
      //返回 token
      const payload = {
        id : user.id,
        _id : user._id,
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
    const type = ctx.state.user[0].type;
    let findResult;
    if(type == 0){
      findResult = await Student.find({id: ctx.state.user[0].id});
    }
    else if(type == 1 ) {
      findResult = await Teacher.find({id: ctx.state.user[0].id});
    }
    const newPwd = ctx.request.body.newPwd;
    const oldPwd = ctx.request.body.oldPwd;
    const user = findResult[0];
    //password: tool.enbcrypt(ctx.request.body.password)
    if(findResult.length === 0){
      return ctx.body = {state:false};
    }else{
      let result = await bcrypt.compareSync(oldPwd, user.password);
      if(result){
        if(type == 0) await
          Student.updateOne({
            id:user.id
          }, {
            password: tool.enbcrypt(newPwd)
          })
        else if(type == 1 )
          await Teacher.updateOne({
            id:user.id
          },{
            password: tool.enbcrypt(newPwd)
          })
        ctx.body = {state:true};
      }else{
        ctx.body = {state:false,msg:"wrong pwd"};
      }
    }
  },

  async ChangeInfo(ctx){
    //console.log(ctx.request.body);
    const type = ctx.state.user[0].type;
    const userid = ctx.state.user[0].id;
    const realName= ctx.request.body.realName;
    const username= ctx.request.body.username;
    const gender = ctx.request.body.gender;
    const phone = ctx.request.body.phone;
    let state;
    if(type === '0') {
      //const findResult = await Student.find({id: ctx.state.user[0].id});
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
      let newUser = await Student.findOne({id: ctx.state.user[0].id});
      ctx.body={state:state,user:newUser};
    }
    else if(type === '1' ) {
      //const findResult = await Teacher.find({id: ctx.state.user[0].id});
      let tea = await Teacher.updateOne({
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
      let newUser = await Teacher.findOne({id: ctx.state.user[0].id});
      ctx.body={state:state,user:newUser};
    }

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
    const type = ctx.state.user[0].type;
    const userid = ctx.state.user[0].id;
    const avatar = ctx.request.files.file;//拿到file.avatar这个对象
    const extName = path.extname(avatar.name);
    let name;
    if(type === '0'){
      name = `stu_${userid + extName}`;
      //从原路径进行到新路径
      fs.renameSync(avatar.path, path.join(__dirname, `../static/img/avatar/${name}`));
      await Student.updateOne({
        id: userid
      }, {
        avatar: `/img/avatar/${name}`
      })
    }else if(type === '1'){
      name = `tea_${userid + extName}`;
      //从原路径进行到新路径
      fs.renameSync(avatar.path, path.join(__dirname, `../static/img/avatar/${name}`));
      await Teacher.updateOne({
        id: userid
      }, {
        avatar: `/img/avatar/${name}`
      })
    }
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
  },


  async send(ctx) {
    const {
      code,
      id,
      password,
      email,
      userType
    } = ctx.request.body
    //校验code
    console.log(check[email]);
    if (code) {
      const saveCode = check[email].code;
      const saveExpire = check[email].expire ;
      //Store.hget(`nodemail:${id}`, 'expire')
      if (code === saveCode) {
        if (new Date().getTime() - saveExpire > 0) {
          ctx.body = {
            state:false,
            msg: '验证码已过期，请重新尝试'
          }
          return false
        }
      } else {
        ctx.body = {
          state:false,
          msg: '请填写正确的验证码'
        }
        return false
      }
    } else {
      ctx.body = {
        state:false,
        msg: '请填写验证码'
      }
      return false
    }
    //校验 username是否已经存在数据库
    if(userType == 0){
      await Student.updateOne({
          id:id
        }, {
          password:tool.enbcrypt(password)
        }
      ).catch(err=>{
        ctx.body = {state:false,errMsg:err.message};
      })
      ctx.body={state:true};
    }else if (userType == 1){
      await Teacher.updateOne({
          id:id
        }, {
          password:tool.enbcrypt(password)
        }
      ).catch(err=>{
        ctx.body = {state:false,errMsg:err.message};
      })
      ctx.body={state:true};
    }
  },

  async verify(ctx) {
    //校验是不是一分钟之内
    const {
      email,
      id,
      userType,
    } = ctx.request.body;
    console.log(ctx.request.body);

    if(userType==0){
      const stu = await Student.findOne({id:id});
      if (stu.email === email);
      else{
        return ctx.body={state:false}
      }
    }else if(userType == 1){
      const Tea = await Teacher.findOne({id:id});
      if (Tea.email === email);
      else{
        return ctx.body={state:false}
      }
    }

    // const saveExpire = await Store.hget(`nodemail:${id}`, 'expire');
    // console.log(saveExpire);
    // if (saveExpire && new Date().getTime() - saveExpire < 0) {
    //   ctx.body = {
    //     code: -1,
    //     msg: '验证请求过于频繁，1分钟内1次'
    //   }
    //   return false
    // }
    //发送端信息
    let transporter = nodemailer.createTransport({
      service: '126',
      //port: 465, // SMTP 端口
      //secureConnection: true, // 使用了 SSL
      //UZHOCTXGQBTSSNHX
      auth: {
        user: "ZJU_Group27@126.com",
        pass: "UZHOCTXGQBTSSNHX",
      }
    });
    //接受端信息
    let ko = {
      code: Math.random().toString(16).slice(2, 6).toUpperCase(),
      expire: new Date() + 600 * 1000,
      email,
      user: id,
    }
    //邮件信息
    let mailOptions = {
      from: `《教学平台》<ZJU_Group27@126.com>`,
      to: ko.email,
      subject: 'ZJU教学平台验证码',
      html: `${ko.user}您好，您正在ZJU教学平台注册，验证码是：${ko.code}`
    };
    //发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      } else {
        // Store.hmset(`nodemail:${ko.user}`, 'code', ko.code)
        // Store.hmset(`nodemail:${ko.user}`, 'expire', ko.expire)
        // Store.hmset(`nodemail:${ko.user}`, 'email', ko.email)
        check[ko.email]={code:ko.code,expire:ko.expire};
        console.log(check[ko.email]);
      }
    });
    //ctx返回值
    ctx.body = {
      state:true,
      msg: '验证码发送成功'
    }
  }
}

