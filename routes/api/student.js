const Router = require('koa-router');
const router = new Router();
const Student = require('../../modules/Student');
const bcrypt = require('bcryptjs');
const tool = require('../../config/tool');
const keys = require('../../config/keys');
const jwt = require('jsonwebtoken');
const passport = require('koa-passport');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable=require('formidable');
const C_stu = require('../../controller/C_student');


router.get('/Fuck',C_stu.Fuck);
/*
 注册模块
 Input: { id / username / password }
 Output:{ state }
*/
router.post('/register',C_stu.Register);
/*
 登陆模块
 Input: { id / password }
 Output:{ state / token / user }
 */
//router.post('/login',C_stu.Login);
// /*
//  修改头像模块
//  Input: { token / avatar[img File] }
//  Output:{ state / data:{avatar} }
//  */
// router.post('/changeAvatar',passport.authenticate('jwt', { session: false }), C_stu.ChangeAvatar);
// router.post('/changeInfo',passport.authenticate('jwt', { session: false }), C_stu.ChangeInfo);
// router.post('/changePwd',passport.authenticate('jwt', { session: false }), C_stu.ChangePwd);

// router.get('/current',passport.authenticate('jwt', { session: false }),async ctx =>{
//     ctx.body = {
//         id : ctx.state.user.id,
//         username : ctx.state.user.username
//     };
// });

module.exports = router.routes();

