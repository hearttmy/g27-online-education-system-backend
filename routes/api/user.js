const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');
const C_user = require('../../controller/C_user');

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

module.exports = router.routes();