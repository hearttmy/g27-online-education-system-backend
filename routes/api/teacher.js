const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');

const C_stu = require('../../controller/C_teacher');

/*
 注册模块
 Input: { id / username / password }
 Output:{ state }
*/
router.post('/register1',C_stu.Register);
/*
 登陆模块
 Input: { id / password }
 Output:{ state / token / user }
 */
router.post('/login1',C_stu.Login);

/*
 修改头像模块
 Input: { token / avatar[img File] }
 Output:{ state / data:{avatar} }
 */
router.post('/changeAvatar',passport.authenticate('jwt', { session: false }), C_stu.ChangeAvatar);

module.exports = router.routes();