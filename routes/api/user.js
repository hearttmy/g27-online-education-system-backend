const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');
const C_user = require('../../controller/C_user');


router.post('/isAdmin',C_user.isAdmin);
/*
 登陆模块
 Input: { id / password }
 Output:{ state / token / user }
 */
router.post('/login',C_user.Login);
/*
 修改头像模块
 Input: { token / avatar[img File] }
 Output:{ state / data:{avatar} }
 */
router.post('/changeAvatar',passport.authenticate('jwt', { session: false }), C_user.ChangeAvatar);
router.post('/changeInfo',passport.authenticate('jwt', { session: false }), C_user.ChangeInfo);
router.post('/changePwd',passport.authenticate('jwt', { session: false }), C_user.ChangePwd);
router.post('/findPwd',C_user.verify);
router.post('/resetPwd',C_user.send);
module.exports = router.routes();

