const koa = require('koa');
const Router = require('koa-router');
const koabody = require('koa-body');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const app = new koa();
const router = new Router;
const passport = require('koa-passport')
require('./config/passport')(passport)

const mongoose = require("mongoose");
const keys = require('./config/keys');
const Fuck = require("./routes/api/Fuck");
const Course = require('./routes/api/course');

app.use(bodyParser());
app.use(cors());
app.use(koabody({
    multipart: true, // 允许解析'multipart/form-data'类型的文件
    formidable: {
        uploadDir: './static' // 设置文件上传保存路径
    },
    enableTypes:['json','form','text'],
}));
// app.use(cors({
//     // origin: ctx => ctx.request.header.origin,
//     exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
//     maxAge: 5,
//     credentials: true,
//     allowMethods: ['GET', 'PUT', 'POST', 'DELETE'],
//     allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
// }));

router.get('/',async ctx=>{
    ctx.body = {
        msg: 'Hello Koa'
    };
})
// app.use(
//     cors({
//         origin: function(ctx) { //设置允许来自指定域名请求
//                 return '*'; // 允许来自所有域名请求
//         },
//         maxAge: 5, //指定本次预检请求的有效期，单位为秒。
//         //credentials: true, //是否允许发送Cookie
//         allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
//         allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
//         exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
//     })
// );

mongoose.connect(keys.serverURL,{ useNewUrlParser: true , useUnifiedTopology: true })
    .then( () => {
        console.log("Mongodb Connectd...");
    })
    .catch(err => {
        console.log(err);
    });

router.use('/api',Fuck);
router.use('/api/course',Course);

app.use(router.routes()).use(router.allowedMethods);



const port = process.env.PORT || 2088;
app.listen(port,()=>{
    console.log('server started on ',port);
})


