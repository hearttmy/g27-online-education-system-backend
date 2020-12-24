const fs=require('fs');
const path=require('path');
const formidable=require('formidable');
const formTime=require('silly-datetime');//格式化时间插件
const UserInfo =require('../model/userInfoModel');

module.exports = upload = (req,res,flag,className)=>{
    let ispath='';
    let email='';
    const form=new formidable.IncomingForm();
    form.encoding='utf-8';
    form.keepExtensions=true;
    if(flag==1){
        ispath='../static/user/'+className;
        UserInfo.findOne({_id:className})
            .then(user=>{
                email=user.email;
            })
    }
    //设置上传目录
    form.uploadDir=path.join(__dirname,ispath);
    //操作请求的数据
    form.parse(req,(err,fields,files)=>{
        let file=files.file;
        console.log(file);
        if(err){
            return res.status(500).json({status:"500",result:"服务器内部错误"});
        }
        //    拼接新的文件名
        const time=formTime.format(new Date(), 'YYYYMMDDHHmmss');
        const  num=Math.floor(Math.random()*(20000-10000+1)+10000);
        const imgName=`${time}_${num}.png`;
        const newFile=form.uploadDir+'/'+imgName;
        fs.rename(file.path,newFile,(err)=>{
            if(err){
                return res.status(412).json({status:'412',result:'上传失败'})
            }else{
                if(flag==1){
                    res.json({status:'200',msg:'图片上传成功',card:imgName});
                }
            }
        })
    })
}
