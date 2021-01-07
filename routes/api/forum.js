const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');
const C_forum = require('../../controller/C_forum');


router.post('/addPost', passport.authenticate('jwt', { session: false }), C_forum.addPost);
router.post('/delPost',C_forum.delPost);
router.post('/getMyPost', passport.authenticate('jwt', { session: false }), C_forum.getMyPost);
router.post('/getPost', C_forum.getPost);
router.post('/addReply',passport.authenticate('jwt', { session: false }),C_forum.replyPost);
router.post('/getReply',C_forum.getReply);

module.exports = router.routes();