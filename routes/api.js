const Router = require('koa-router');
const router = new Router();

const student = require('./api/student');
const teacher = require('./api/teacher');
const Course = require('./api/course');
const Addapi = require('./api/add');

router.use('/api',student);
router.use('/api',teacher);
router.use('/api/course',Course);
router.use('/add',Addapi);


module.exports = router.routes();