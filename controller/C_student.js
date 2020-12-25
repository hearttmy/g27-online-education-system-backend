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

//var router = new Router();

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
            })

            await newStudent.save().then(user =>{
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
        console.log(ctx.request.body);
        let findResult = await Student.find({id: ctx.request.body.id});
        console.log(findResult);
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
            };
            const token = jwt.sign(payload,keys.secretTokenKey,{expiresIn: 3600*24*7});
            if(result){
                ctx.body = {success:true, token:"Bearer "+token , user : user};
            }else{
                ctx.body = {success:false};
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
    async ChangeAvatar(ctx){
        //拿到user的id
        console.log(ctx.request.files);
        const userid = ctx.state.user[0].id;
        const avatar = ctx.request.files.file;//拿到file.avatar这个对象
        const extName = path.extname(avatar.name);
        const name = `stu_${userid + extName}`;
        console.log(name);
        //从原路径进行到新路径
        fs.renameSync(avatar.path,path.join(__dirname,`../static/img/avatar/${name}`));
        //
        await Student.updateOne({
            id: userid
        },{
            avatar:`/img/avatar/${name}`
        })
        //上传的图片格式不一样，即存在名为xx.png xx.jpg两种
        //需要删除原来的图片
        if(ctx.state.user[0].avatar !== '/img/avatar/default.png' && path.extname(ctx.state.user[0].avatar) !== extName){
            fs.unlinkSync(path.join(__dirname,`../static${ctx.state.user[0].avatar}`))
        }
        ctx.body = {
            state: true,
            data: {
                avatar:`/img/avatar/${name}`
            }
        }
    },

}




// router.post('/register', async (ctx) =>{
//     //console.log(ctx.request.body);
//     const findResult = await Student.find({id: ctx.request.body.id});
//     //console.log(findResult);
//     if(findResult.length>0){
//         ctx.status = 500;
//         ctx.body = {state:false};
//     }else{
//         const newStudent = new Student({
//             username: ctx.request.body.username,
//             id: ctx.request.body.id,
//             password: tool.enbcrypt(ctx.request.body.password),
//         })
//
//         await newStudent.save().then(user =>{
//             ctx.body = {state:true};
//         }).catch(err => {
//             console.log(err);
//         });
//     }
// });
//
// router.post('/login',async ctx => {
//     console.log(ctx.req.body);
//     let findResult = await Student.find({id: ctx.request.body.id});
//     const password = ctx.request.body.password;
//     const user = findResult[0];
//     if(findResult.length = 0){
//         ctx.status = 404;
//         ctx.body = {id:'用户不存在'};
//     }else{
//         let result = await bcrypt.compareSync(password, user.password);
//         //返回 token
//         const payload = {_id : user._id};
//         const token = jwt.sign(payload,keys.secretTokenKey,{expiresIn: 3600});
//         //console.log(token);
//         if(result){
//             ctx.status = 200 ;
//             ctx.body = {success:true, token:"Bearer "+token , user : user};
//         }else{
//             ctx.status = 400;
//             ctx.body = {success:false};
//         }
//     }
// })
//
// router.get('/current',passport.authenticate('jwt', { session: false }),async ctx =>{
//     ctx.body = {
//         id : ctx.state.user.id,
//         username : ctx.state.user.username
//     };
// })
//
// router.post('/changeAvatar',passport.authenticate('jwt', { session: false }), async (ctx,req) => {
//     const userid = ctx.state.user.id;//拿到user的id
//     //console.log();
//     console.log(ctx.request.files);
//
//     const avatar = ctx.request.files.avatar;//拿到file.avatar这个对象
//     const extName = path.extname(avatar.name);//图片名称
//     const name = `stu_${userid + path.extname(avatar.name)}`;//规范化图片名
//
//     fs.renameSync(avatar.path, path.join(__dirname, `../public/static/img/avatar/${name}`));
//
//     await Student.updateOne({
//         id: userid
//     }, {
//         avatar: `/static/img/avatar/${name}`
//     })
//         .then(docs => {
//             if (ctx.state.user.avatar !== '/static/img/avatar/default.png' && path.extname(ctx.state.user.avatar) !== extName) {
//                 setTimeout(() => {
//                     try {
//                         fs.unlinkSync(path.join(__dirname, `../public${ctx.state.user.avatar}`));
//                     } catch (err) {}
//                 }, 0);
//             }
//
//
//             ctx.body = {
//                 code: 1,
//                 data: {
//                     avatarUrl: `keys.serverURL/static/img/avatar/${name}`
//                 }
//             };
//         })
//         .catch(err => {
//             ctx.body = {
//                 code: -1,
//                 errMsg: err.message
//             }
//         });
// })
//
// router.get('/getUrl',async (ctx) => {
//     let filePath = path.join(__dirname, ctx.url); //图片地址
//     console.log(__dirname,ctx.url,filePath);
//     let file = null;
//     try {
//         file = fs.readFileSync(filePath); //读取文件
//     } catch (error) {
//         //如果服务器不存在请求的图片，返回默认图片
//         filePath = path.join(__dirname, '../../static/img/avatar/default.png'); //默认图片地址
//         file = fs.readFileSync(filePath); //读取文件
//     }
//     let mimeType = mime.lookup(filePath); //读取图片文件类型
//     ctx.set('content-type', mimeType); //设置返回类型
//     ctx.body = file; //返回图片
// });
//
// module.exports = router.routes();