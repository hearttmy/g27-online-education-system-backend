const mongoose = require('mongoose');

const couGroupSchema = new mongoose.Schema({
    courseID:{
        type:String,
        require:true,
    },
    groupName:{
        type:String,
    },
    stuID:[{
        type:String,
        require:true,
    }]
});

module.exports = couGroup = mongoose.model('couGroup', couGroupSchema);