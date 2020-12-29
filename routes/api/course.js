const Router = require('koa-router');
const router = new Router();
const CourseInfo = require('../../modules/courseInfo');
const passport = require('koa-passport');
const C_cou = require('../../controller/C_course');


router.get('/AllInfo',async ctx =>{
    //let findResult = await CourseInfo.find({});
    const findResult = await  CourseInfo.aggregate( [
        { $sample:
                { size: 8 }
        }] )
    //console.log(findResult);
    ctx.body = findResult;
})
router.get('/search',C_cou.Search);

router.post('/setState',C_cou.SetState);

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
router.post('/delchapter', passport.authenticate('jwt', { session: false }), C_cou.delChapter);
//,passport.authenticate('jwt', { session: false })

/*
添加课件
输入{courseID/chapterID/fileName}
输出{state}
 */
router.post('/addFile',passport.authenticate('jwt', { session: false }),C_cou.AddFile);
router.post('/delFile',passport.authenticate('jwt', { session: false }),C_cou.DelFile);

module.exports = router.routes();