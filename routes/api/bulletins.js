const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');

const C_bulletins = require('../../controller/C_bulletins');
/*
添加布告
input:  {courseID/title/content}
output: {state}
*/
router.post('/addBulletins',C_bulletins.addBulletins);

/*
获得布告
input:  {courseID}
output: {state}
*/
router.post('/getBulletins',C_bulletins.getBulletins);

/*
删除布告
input:  {BulletinID}
output: {state}
*/
router.post('/delBulletins',C_bulletins.delBulletins);

router.post('/userIndex',passport.authenticate('jwt', { session: false }),C_bulletins.MyBulletins);
module.exports = router.routes();

