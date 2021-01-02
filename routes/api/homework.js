const Router = require('koa-router');
const router = new Router();

const C_hw = require('../../controller/C_homework');

router.get('/getHW',C_hw.getHW);

router.post('/addHW',C_hw.newHW);

router.post('/fileToHW',C_hw.fileToHW);

module.exports = router.routes();