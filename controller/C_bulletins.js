const Bulletins = require('../modules/bulletins');

module.exports = {
    async addBulletins(ctx){
        const {
            courseID,
            title,
            content,
        }=ctx.request.body;

        const Bulletin = new Bulletins({
            courseID:courseID,
            title:title,
            content:content,
        })

        await Bulletin.save().then(()=>{
            ctx.body={state:true}
        }).catch(err=>{
            ctx.body={state:false,errMsg:err.message}
        });
    },

    async getBulletins(ctx){
        const {
            courseID,
        } = ctx.request.body;

        const docs = await Bulletins.find({
            courseID:courseID
        }).catch(err=>{
            ctx.body={state:false,errMsg:err.message}
        })

        ctx.body={state:true,Bulletins:docs}
    },

    async delBulletins(ctx){
        const {
            BulletinID
        } = ctx.request.body;

        await Bulletins.remove({
            _id:BulletinID
        }).then(()=>{
            ctx.body={state:true}
        }).catch(err=>{
            ctx.body={stata:false,errMsg:err.message}
        })
    }
}

