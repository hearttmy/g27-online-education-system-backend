const koa = require('koa');
const Router = require('koa-router');
const koabody = require('koa-body');
const static = require('koa-static');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const path = require('path');
const app = new koa();
const router = new Router;
const passport = require('koa-passport')
require('./config/passport')(passport)

const mongoose = require("mongoose");
const keys = require('./config/keys');
const student = require("./routes/api/student");
const Course = require('./routes/api/course');

//跨域
app.use(cors());
//静态文件
app.use(static(path.join(__dirname , './static')));
//body
app.use(bodyParser());
app.use(koabody({
    multipart: true, // 允许解析'multipart/form-data'类型的文件
    formidable: {
        //uploadDir: './static/img/avatar' // 设置文件上传保存路径
        uploadDir: path.join(__dirname, './static')
    },
    enableTypes:['json','form','text'],
}));

router.get('/',async ctx=>{
    ctx.body = {
        msg: 'Hello Koa'
    };
})

mongoose.connect(keys.serverURL,{ useNewUrlParser: true , useUnifiedTopology: true })
    .then( () => {
        console.log("Mongodb Connectd...");
    })
    .catch(err => {
        console.log(err);
    });

router.use('/api',student);
router.use('/api/course',Course);

app.use(router.routes()).use(router.allowedMethods);


const port = process.env.PORT || 2088;
app.listen(port,()=>{
    console.log('server started on ',port);
    console.log(path.join(__dirname , '/static'));
    console.log(__dirname);
})



