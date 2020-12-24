const Router = require('koa-router');
const router = new Router();
const CourseInfo = require('../../modules/courseInfo');

router.get('/AllInfo',async ctx =>{
    let findResult = await CourseInfo.find({});
    //console.log(findResult);
    ctx.body = findResult;

})

router.post('/add', async (ctx) =>{
    //console.log(ctx.request.body);
    const findResult = await CourseInfo.find({id: ctx.request.body.courseID});
    //console.log(findResult);
    if(findResult.length>0){
        ctx.status = 500;
        ctx.body = {state:false};
    }else{
        const newCourse = new CourseInfo({
            coursename: ctx.request.body.coursename,
            courseID: ctx.request.body.courseID,
            DurationTime: ctx.request.body.DurationTime,
            teacherID:ctx.request.body.teacherID,
        })

        await newCourse.save().then(user =>{
            ctx.body = {state:true};
        }).catch(err => {
            console.log(err);
        });
    }
});

module.exports = router.routes();