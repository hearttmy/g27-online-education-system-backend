const Router = require('koa-router');
const router = new Router();
const CourseInfo = require('../../modules/courseInfo');
const passport = require('koa-passport');
const C_cou = require('../../controller/C_course');


router.get('/AllInfo',async ctx =>{
    let findResult = await CourseInfo.find({});
    //console.log(findResult);
    ctx.body = findResult;
})


router.post('/addcourse', passport.authenticate('jwt', { session: false }), C_cou.addcourse);

router.post('/changeimg',passport.authenticate('jwt', { session: false }), C_cou.ChangeImg);

router.get('/CoursebyID',C_cou.CoursebyID);

router.get('/CoursebyType',C_cou.CoursebyType);

/*
新增章节
输入{courseID,ChapterName}
输出{state}
 */
router.post('/addchapter',passport.authenticate('jwt', { session: false }),C_cou.addChapter);
//,passport.authenticate('jwt', { session: false })

/*
添加课件
输入{courseID/chapterID/fileName}
输出{state}
 */
router.post('/addFile',C_cou.AddFile);

module.exports = router.routes();