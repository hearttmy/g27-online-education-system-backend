const Student = require('../modules/Student');
const Teacher = require('../modules/Teacher');
const bcrypt = require('bcryptjs');
const tool = require('../config/tool');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

module.exports = {
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
        const type = ctx.request.body.type;
        let findResult;
        if(type == 0) {
             findResult = await Student.find({id: ctx.request.body.id});
        }
        else if(type ==1 ) {
             findResult = await Teacher.find({id: ctx.request.body.id});
        }
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
            await Student.updateOne({
                id: userid
            }, {
                avatar: `/img/avatar/${name}`
            })
        }
        //上传的图片格式不一样，即存在名为xx.png xx.jpg两种
        //需要删除原来的图片
        if (ctx.state.user[0].avatar !== '/img/avatar/default.png' && path.extname(ctx.state.user[0].avatar) !== extName) {
            fs.unlinkSync(path.join(__dirname, `../static${ctx.state.user[0].avatar}`))
        }
        //fs.unlink(avatar.path);
        //const Newuser = await Student.find({id:userid});
        ctx.body = {
            state: true,
            avatar: `/img/avatar/${name}`,
        }
    }
}