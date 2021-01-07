const Course = require('../modules/courseInfo');
const Student = require('../modules/Student');
const Homework = require('../modules/Homework');
const Group = require('../modules/courseGroup');
const HWSubmission = require('../modules/HWsubmission');
const Grade = require('../modules/grade');
const fs = require('fs');
const path = require('path');

async function InGroup(ctx){
    const{
        courseID,
        stuID,
    } = ctx;

    const group = await Group.find({courseID:courseID});

    let result = false;
    group.map(item => {
        if(item.stuID.indexOf(stuID)===-1) ;
        else result = true;
    })

    return result;
}

module.exports = {

    async makeGroup(ctx){
        const {
            courseID,
            groupName,
            groupMember,
        } = ctx.request.body;

        const newGroup = new Group({
            groupName:groupName,
            courseID:courseID,
        })

        await newGroup.save();

        groupMember.map(async (item) => {
                await Group.updateOne({
                    groupName:groupName,
                    courseID:courseID,
                },{
                $push:{
                    stuID:
                        `${item.id}`
                }
            })
        })

        ctx.body = {state:true};
    },

    async delGroup(ctx){
      const {
          groupID
      } = ctx.request.body;

        await Group.remove({
            _id:groupID
        }).then(()=>{
            ctx.body = {state:true}
        }).catch(err=>{
            ctx.body = {state:false,err:err.message}
        })

    },
    async getGroup(ctx){
        const {
            courseID
        } = ctx.request.body;

        const docs = await Group.aggregate([
            {
                $match:{
                    courseID:courseID
                }
            },{
                $lookup:{
                    from:"students",
                    localField:"stuID",
                    foreignField:"id",
                    as:"stu"
                }
            },{
                $project:{
                    __v:0,
                    stuID:0,
                    stu:{
                        _id: 0,
                        __v: 0,
                        password: 0,
                        created: 0,
                        study: 0,
                        date: 0,
                        email: 0,
                        phone: 0,
                        gender: 0,
                        type: 0,
                    }
                }
            }
        ])
        return ctx.body={ state:true,Group:docs }
    },

    async stuNoGroup(ctx){
        const {
            courseID
        } = ctx.request.body;

        const cou = await Course.findOne({courseID:courseID});

        let r = await Promise.all( cou.students.map(async (item)=>{
            let param = {courseID:courseID,stuID:item}
            let re = await InGroup(param);
            if( re === false ){
                const stu = await Student.aggregate([
                    {
                        $match: {
                            id: item
                        },
                    },{
                        $project:{
                            id:1,
                            realName:1,
                        }
                    }
                ])
                return stu;
            }
        }));
        return ctx.body={state:true,noGroup:r};
    },


}
