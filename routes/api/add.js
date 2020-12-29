const Router = require('koa-router');
const router = new Router();
const bulletins = require('../../modules/bulletins');
const Chapter = require('../../modules/Chapter');
const File = require('../../modules/File');
const forum = require('../../modules/forum');
const forumcontent = require('../../modules/forumcontent');
const coursefile = require('../../modules/coursefile');


router.get('/add',async ctx =>{
    //let findResult = await CourseInfo.find({});
    const newbu = new coursefile({
        id:1,
    });
    await newbu.save({id:1})
        .then(user =>{
        ctx.body = {state:true};
    }).catch(err => {
        console.log(err);
    });
    console.log(1);
})

module.exports = router.routes();