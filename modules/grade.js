const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couGrade = new Schema({
  courseID:{
    type:String,
    require:true,
  },
  stuID:{
    type:String,
    require:true,
  },
  hwScore:{
    type:Number,
    default:0
  },
  finalScore:{
    type:Number,
    default:0
  }
});

module.exports = CouGrade = mongoose.model('couGrade', couGrade);
