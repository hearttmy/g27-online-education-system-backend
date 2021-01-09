const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HWSubmissionSchema = new mongoose.Schema({
  stuID:{
    type:String,
    require:true,
  },
  hwID:{
    type:String,
    require:true,
  },
  grade:{
    type:Number,
    default:-1
  },
  description:{
    type:String,
    default:"",
  },
  fileName:{
    type:String,
  },
  fileUrl: {
    type:String,
  },
  time:{
    type:Date,
    default:Date.now,
  },
  comment:{
    type:String,
  }

})


module.exports = HWSubmission = mongoose.model('HWSubmission', HWSubmissionSchema);
