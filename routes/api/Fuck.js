const Router = require('koa-router');
const router = new Router();
const Student = require('../../modules/Student');
var bcrypt = require('bcryptjs');
const tool = require('../../config/tool');
const keys = require('../../config/keys');
const jwt = require('jsonwebtoken');
const passport = require('koa-passport');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable=require('formidable');

//var router = new Router();

router.get('/Fuck', async ctx =>{
    ctx.status=200;
    ctx.body = {msg :'What the Fuck?'};
    //console.log(ctx.body);1
});

router.post('/register', async (ctx) =>{
    //console.log(ctx.request.body);
    const findResult = await Student.find({id: ctx.request.body.id});
    //console.log(findResult);
    if(findResult.length>0){
        ctx.status = 500;
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
});

router.post('/login',async ctx => {
    console.log(ctx.req.body);
    let findResult = await Student.find({id: ctx.request.body.id});
    const password = ctx.request.body.password;
    const user = findResult[0];
    if(findResult.length = 0){
        ctx.status = 404;
        ctx.body = {id:'用户不存在'};
    }else{
        let result = await bcrypt.compareSync(password, user.password);
        //返回 token
        const payload = {_id : user._id};
        const token = jwt.sign(payload,keys.secretTokenKey,{expiresIn: 3600});
        //console.log(token);
        if(result){
            ctx.status = 200 ;
            ctx.body = {success:true, token:"Bearer "+token , user : user};
        }else{
            ctx.status = 400;
            ctx.body = {success:false};
        }
    }
})

router.get('/current',passport.authenticate('jwt', { session: false }),async ctx =>{
    ctx.body = {
        id : ctx.state.user.id,
        username : ctx.state.user.username
    };
})

router.post('/changeAvatar',passport.authenticate('jwt', { session: false }), async (ctx,req) => {
    const userid = ctx.state.user.id;//拿到user的id
    //console.log();
    console.log(ctx.request.files);

    const avatar = ctx.request.files.avatar;//拿到file.avatar这个对象
    const extName = path.extname(avatar.name);//图片名称
    const name = `stu_${userid + path.extname(avatar.name)}`;//规范化图片名

    fs.renameSync(avatar.path, path.join(__dirname, `../public/static/img/avatar/${name}`));

    await Student.updateOne({
        id: userid
    }, {
        avatar: `/static/img/avatar/${name}`
    })
        .then(docs => {
            if (ctx.state.user.avatar !== '/static/img/avatar/default.png' && path.extname(ctx.state.user.avatar) !== extName) {
                setTimeout(() => {
                    try {
                        fs.unlinkSync(path.join(__dirname, `../public${ctx.state.user.avatar}`));
                    } catch (err) {}
                }, 0);
            }


            ctx.body = {
                code: 1,
                data: {
                    avatarUrl: `keys.serverURL/static/img/avatar/${name}`
                }
            };
        })
        .catch(err => {
            ctx.body = {
                code: -1,
                errMsg: err.message
            }
        });
})

router.get('/getUrl',async (ctx) => {
    let filePath = path.join(__dirname, ctx.url); //图片地址
    console.log(__dirname,ctx.url,filePath);
    let file = null;
    try {
        file = fs.readFileSync(filePath); //读取文件
    } catch (error) {
        //如果服务器不存在请求的图片，返回默认图片
        filePath = path.join(__dirname, '../../static/img/avatar/default.png'); //默认图片地址
        file = fs.readFileSync(filePath); //读取文件
    }
    let mimeType = mime.lookup(filePath); //读取图片文件类型
    ctx.set('content-type', mimeType); //设置返回类型
    ctx.body = file; //返回图片
});

module.exports = router.routes();