const Router = require('koa-router');
const router = new Router();

const student = require('./api/student');
const teacher = require('./api/teacher');
const Course = require('./api/course');
const user = require('./api/user');

router.use('/api',student);
router.use('/api',teacher);
router.use('/api',user);
router.use('/api/course',Course);


module.exports = router.routes();