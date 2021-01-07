//const Router = require('koa-router');
//const router = new Router();
const Teacher = require('../modules/Teacher');
const bcrypt = require('bcryptjs');
const tool = require('../config/tool');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable=require('formidable');

module.exports = {
    /*
    注册模块
    判断id唯一性
    若id重复 在state字段返回false
    若注册成功 state字段返回true
     */
    async Register(ctx) {
        console.log(ctx.request.body);
        //id查重
        const findResult = await Teacher.find({id: ctx.request.body.id});
        //返回state :false
        if(findResult.length>0){
            ctx.body = {state:false};
        }else{
            const newTeacher = new Teacher({
                username: ctx.request.body.username,
                id: ctx.request.body.id,
                password: tool.enbcrypt(ctx.request.body.password),
                realName: ctx.request.body.realName,
                email:ctx.request.body.email,
            })

            await newTeacher.save().then(user =>{
                ctx.body = {state:true};
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
        let findResult = await Teacher.find({id: ctx.request.body.id});
        const password = ctx.request.body.password;
        const user = findResult[0];
        if(findResult.length = 0){
            return ctx.body = {state:false};
        }else{
            let result = await bcrypt.compareSync(password, user.password);
            //返回 token
            const payload = {
                id : user.id,
                _id : user._id,
                avatar : user.avatar,
                username : user.username,
                type : "1",
            };
            const token = jwt.sign(payload,keys.secretTokenKey,{expiresIn: 3600*24*7});
            if(result){
                ctx.body = {state:true, token:"Bearer "+token , user : user};
            }else{
                ctx.body = {state:false};
            }
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
        const userid = ctx.state.user[0].id;
        const avatar = ctx.request.files.file;//拿到file.avatar这个对象
        const extName = path.extname(avatar.name);
        const name = `tea_${userid + extName}`;
        //console.log(name);
        //从原路径进行到新路径
        fs.renameSync(avatar.path, path.join(__dirname, `../static/img/avatar/${name}`));
        //
        await Teacher.updateOne({
            id: userid
        }, {
            avatar: `/img/avatar/${name}`
        })
        //上传的图片格式不一样，即存在名为xx.png xx.jpg两种
        //需要删除原来的图片
        // if (ctx.state.user[0].avatar !== '/img/avatar/default.png' && path.extname(ctx.state.user[0].avatar) !== extName) {
        //     fs.unlinkSync(path.join(__dirname, `../static${ctx.state.user[0].avatar}`))
        // }
        ctx.body = {
            state: true,
            avatar: `/img/avatar/${name}`,
        }
    }
}
