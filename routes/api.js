const Router = require('koa-router');
const router = new Router();

const student = require('./api/student');
const teacher = require('./api/teacher');
const Course = require('./api/course');
const user = require('./api/user');
const homework = require('./api/homework');
const Bulletins = require('./api/bulletins');
const forum = require('./api/forum');

router.use('/api',student);
router.use('/api',teacher);
router.use('/api',user);
router.use('/api/course',homework);
router.use('/api/course',Course);
router.use('/api/course',Bulletins);
router.use('/api/course',forum);


module.exports = router.routes();