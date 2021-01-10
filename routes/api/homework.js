const Router = require('koa-router');
const router = new Router();

const passport = require('koa-passport');
const C_hw = require('../../controller/C_homework');
const C_hwGroup = require('../../controller/C_groupHW');

router.get('/getHW',C_hw.getHW);

router.post('/addHW',C_hw.newHW);

router.post('/fileToHW',C_hw.fileToHW);
router.post('/delHWFile',C_hw.delHWFile);

router.post('/submitHW',passport.authenticate('jwt', { session: false }),C_hw.submitHW);

router.get('/getSubmit',C_hw.getSubmit);

router.post('/delSubmitHW',C_hw.delSubmitHW);


router.post('/DelHW',C_hw.DelNewHW);

router.get('/MySubmit',passport.authenticate('jwt', { session: false }),C_hw.MySubmit);
router.get('/IsSubmit',passport.authenticate('jwt', { session: false }),C_hw.IsSubmit);

router.post('/getGrade',passport.authenticate('jwt', { session: false }),C_hw.getGrade);
router.post('/getAllGrade',C_hw.getAllGrade);

router.post('/SetExamGrade',C_hw.SetExamGrade);
router.post('/setGrade',C_hw.setGrade);

router.post('/makeGroup',C_hwGroup.makeGroup);
router.post('/getGroup',C_hwGroup.getGroup);
router.post('/delGroup',C_hwGroup.delGroup);
router.post('/stuNoGroup',C_hwGroup.stuNoGroup);
router.post('/test',C_hw.test);

module.exports = router.routes();
